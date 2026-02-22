import { createClient } from '@/lib/supabase/server';
import { GlassCard } from '@/components/ui/glass-card';
import Link from 'next/link';

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: license } = await supabase
    .from('licenses')
    .select('tier, status')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  const tier = license?.tier ?? 'free';
  const status = license?.status ?? 'active';

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Billing</h1>

      <GlassCard className="mb-6">
        <h2 className="mb-2 font-semibold">Aktueller Plan</h2>
        <p className="capitalize text-white/90">{tier}</p>
        <p className="mt-1 text-sm text-white/60">Status: {status}</p>
      </GlassCard>

      <GlassCard className="mb-6">
        <h2 className="mb-2 font-semibold">Kundenportal</h2>
        <p className="mb-4 text-sm text-white/70">
          Abos verwalten, Rechnungen herunterladen (Lemon Squeezy).
        </p>
        <a
          href="#"
          className="inline-block rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20"
        >
          Portal öffnen (Sprint 4)
        </a>
      </GlassCard>

      <GlassCard>
        <h2 className="mb-2 font-semibold">Credits nachkaufen</h2>
        <p className="mb-4 text-sm text-white/70">
          One-Time Credit-Packs (Sprint 4).
        </p>
        <Link
          href="/pricing"
          className="inline-block rounded-lg border border-white/20 px-4 py-2 hover:bg-white/5"
        >
          Preise ansehen
        </Link>
      </GlassCard>
    </div>
  );
}
