import { createServiceClient } from '@/lib/supabase/service';
import { NextResponse } from 'next/server';
import { verifySignature } from '@/lib/lemon-squeezy';
import type { LemonSqueezyWebhookPayload } from '@/lib/lemon-squeezy';

const EVENT_ID_HEADER = 'x-event-name';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-signature');
  const eventId = request.headers.get(EVENT_ID_HEADER);
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: LemonSqueezyWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as LemonSqueezyWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventName = payload.meta?.event_name ?? eventId;
  const supabase = createServiceClient();

  // Idempotency: check webhook_events
  const eventUniqueId = payload.data?.id ? `${eventName}-${payload.data.id}` : null;
  if (eventUniqueId) {
    const { data: existing } = await supabase
      .from('webhook_events')
      .select('id, status')
      .eq('event_id', eventUniqueId)
      .single();
    if (existing?.status === 'processed') {
      return NextResponse.json({ received: true });
    }
  }

  // Store as pending (use service role if needed for insert)
  const { data: insertData, error: insertError } = await supabase
    .from('webhook_events')
    .insert({
      source: 'lemon_squeezy',
      event_id: eventUniqueId,
      payload: payload as unknown as Record<string, unknown>,
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertError && !insertError.message?.includes('duplicate')) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  let processError: string | null = null;
  try {
    if (eventName === 'order_created') {
      await processOrderCreated(supabase, payload);
    } else if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      await processSubscriptionUpdate(supabase, payload);
    } else if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
      await processSubscriptionCancelled(supabase, payload);
    }
  } catch (e) {
    processError = e instanceof Error ? e.message : 'Unknown error';
  }

  const webhookRowId = insertData?.id;
  if (webhookRowId) {
    await supabase
      .from('webhook_events')
      .update({
        status: processError ? 'failed' : 'processed',
        error_message: processError,
        processed_at: new Date().toISOString(),
      })
      .eq('id', webhookRowId);
  }

  if (processError) {
    return NextResponse.json({ error: processError }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}

async function processOrderCreated(supabase: ReturnType<typeof createServiceClient>, payload: LemonSqueezyWebhookPayload) {
  const attrs = payload.data?.attributes as Record<string, unknown> | undefined;
  const userId = payload.meta?.custom_data?.user_id;
  if (!userId) return;
  const total = (attrs?.total as number) ?? 0;
  const creditsToAdd = Math.floor(total / 100); // e.g. 1 credit per 1€
  if (creditsToAdd <= 0) return;

  const { data: licenses } = await supabase
    .from('licenses')
    .select('id, credits_balance')
    .eq('user_id', userId)
    .limit(1);
  const license = licenses?.[0];
  if (!license) return;

  await supabase
    .from('licenses')
    .update({ credits_balance: (license.credits_balance ?? 0) + creditsToAdd })
    .eq('id', license.id);

  await supabase.from('credit_logs').insert({
    license_id: license.id,
    amount: creditsToAdd,
    action: 'purchase',
    metadata: { order_id: payload.data?.id },
  });
}

async function processSubscriptionUpdate(supabase: ReturnType<typeof createServiceClient>, payload: LemonSqueezyWebhookPayload) {
  const attrs = payload.data?.attributes as Record<string, unknown> | undefined;
  const userId = payload.meta?.custom_data?.user_id;
  if (!userId) return;

  const variantId = attrs?.variant_id as number | undefined;
  const tier = variantId === 2 ? 'pro' : variantId === 3 ? 'agency' : 'starter';
  const { data: licenses } = await supabase
    .from('licenses')
    .select('id')
    .eq('user_id', userId)
    .limit(1);
  const license = licenses?.[0];
  if (!license) return;

  await supabase
    .from('licenses')
    .update({ status: 'active', tier })
    .eq('id', license.id);
}

async function processSubscriptionCancelled(supabase: ReturnType<typeof createServiceClient>, payload: LemonSqueezyWebhookPayload) {
  const userId = payload.meta?.custom_data?.user_id;
  if (!userId) return;

  const { data: licenses } = await supabase
    .from('licenses')
    .select('id')
    .eq('user_id', userId)
    .limit(1);
  const license = licenses?.[0];
  if (!license) return;

  await supabase
    .from('licenses')
    .update({ status: 'expired' })
    .eq('id', license.id);
}
