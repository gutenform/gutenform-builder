import { createServiceClient } from '@/lib/supabase/service';
import { NextResponse } from 'next/server';

const RATE_LIMIT_PER_MINUTE = 10;
const rateMap = new Map<string, number[]>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const window = 60 * 1000;
  let times = rateMap.get(key) ?? [];
  times = times.filter((t) => now - t < window);
  if (times.length >= RATE_LIMIT_PER_MINUTE) return false;
  times.push(now);
  rateMap.set(key, times);
  return true;
}

export async function POST(request: Request) {
  const licenseKey = request.headers.get('x-license-key');
  if (!licenseKey) {
    return NextResponse.json({ error: 'Missing x-license-key' }, { status: 401 });
  }

  if (!checkRateLimit(licenseKey)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  const supabase = createServiceClient();
  const { data: license } = await supabase
    .from('licenses')
    .select('id, user_id, key_prefix, credits_balance, status')
    .eq('key_prefix', licenseKey.slice(0, 6))
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (!license) {
    return NextResponse.json({ error: 'Invalid or expired license' }, { status: 401 });
  }

  if ((license.credits_balance ?? 0) < 1) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
  }

  let body: { prompt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const prompt = body.prompt ?? '';
  if (!prompt.trim()) {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 });
  }

  const { data: activePrompt } = await supabase
    .from('system_prompts')
    .select('prompt_text')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  const systemPrompt = activePrompt?.prompt_text ?? 'You are a helpful assistant that outputs JSON.';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: 'AI request failed', details: err }, { status: 502 });
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? '{}';
  const tokensUsed = data.usage?.total_tokens ?? 100;
  const creditsToDeduct = Math.max(1, Math.ceil(tokensUsed / 100));

  await supabase
    .from('licenses')
    .update({ credits_balance: (license.credits_balance ?? 0) - creditsToDeduct })
    .eq('id', license.id);

  await supabase.from('credit_logs').insert({
    license_id: license.id,
    amount: -creditsToDeduct,
    action: 'ai_generate',
    metadata: { tokens: tokensUsed },
  });

  return NextResponse.json(JSON.parse(content));
}
