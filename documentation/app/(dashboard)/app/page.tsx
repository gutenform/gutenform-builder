import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { GlassCard } from '@/components/ui/glass-card';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const { data: licenses } = await supabase
    .from('licenses')
    .select('credits_balance, credits_monthly_limit, tier, status')
    .eq('user_id', user.id)
    .limit(1);

  const license = licenses?.[0];
  const balance = license?.credits_balance ?? 0;
  const limit = license?.credits_monthly_limit ?? 500;
  const name = profile?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <p className="text-white/70">Willkommen, {name}.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <GlassCard>
          <h2 className="mb-2 font-semibold">Credits</h2>
          <p className="text-3xl font-bold">{balance}</p>
          <p className="mt-1 text-sm text-white/60">von {limit} pro Monat</p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${Math.min(100, (balance / limit) * 100)}%` }}
            />
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="mb-2 font-semibold">Plan</h2>
          <p className="text-lg capitalize text-white/90">{license?.tier ?? 'free'}</p>
          <p className="mt-1 text-sm text-white/60">Status: {license?.status ?? 'active'}</p>
        </GlassCard>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/app/keys"
          className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20"
        >
          Key kopieren
        </Link>
        <Link
          href="/app/billing"
          className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20"
        >
          Credits kaufen
        </Link>
        <Link
          href="/docs"
          className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/5"
        >
          Doku lesen
        </Link>
      </div>
    </div>
  );
}
