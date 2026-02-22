import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Delete profile (cascades to licenses if FK is set; otherwise delete licenses first)
  await supabase.from('profiles').delete().eq('id', user.id);
  await supabase.from('licenses').delete().eq('user_id', user.id);

  return NextResponse.json({ ok: true });
}
