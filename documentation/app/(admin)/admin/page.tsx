import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { GlassCard } from '@/components/ui/glass-card';

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [profilesRes, licensesRes, creditLogsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('licenses').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('credit_logs').select('amount').limit(1000),
  ]);

  const totalUsers = profilesRes.count ?? 0;
  const activeLicenses = licensesRes.count ?? 0;
  const recentCredits = (creditLogsRes.data ?? []).reduce((sum, r) => sum + (r.amount < 0 ? -r.amount : 0), 0);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admin</h1>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <GlassCard>
          <p className="text-sm text-white/60">Nutzer</p>
          <p className="text-2xl font-bold">{totalUsers}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-white/60">Aktive Lizenzen</p>
          <p className="text-2xl font-bold">{activeLicenses}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-white/60">Credits verbraucht (letzte 1000 Logs)</p>
          <p className="text-2xl font-bold">{recentCredits}</p>
        </GlassCard>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link href="/admin/users" className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20">
          User Management
        </Link>
        <Link href="/admin/credits" className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20">
          Credits
        </Link>
        <Link href="/admin/payments" className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20">
          Payments
        </Link>
        <Link href="/admin/audit" className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20">
          Audit Log
        </Link>
        <Link href="/admin/webhooks" className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20">
          Webhooks
        </Link>
        <Link href="/admin/prompts" className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20">
          Prompts
        </Link>
        <Link href="/admin/blocks" className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20">
          Blocks
        </Link>
      </div>
    </div>
  );
}
