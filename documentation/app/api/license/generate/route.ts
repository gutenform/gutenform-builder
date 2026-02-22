import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Stub: In Sprint 4 this will call Supabase Edge Function /v1/license/generate.
 * For now we create a license row with a placeholder key_prefix for the user.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Bitte melde dich an, um einen Key zu erstellen.' },
      { status: 401 }
    );
  }

  const prefix = 'sk_' + Math.random().toString(36).slice(2, 6);
  const { data, error } = await supabase
    .from('licenses')
    .insert({
      user_id: user.id,
      key_prefix: prefix,
      status: 'active',
      tier: 'free',
      credits_balance: 500,
      credits_monthly_limit: 500,
    })
    .select('id, key_prefix')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: data.id, key_prefix: data.key_prefix });
}
