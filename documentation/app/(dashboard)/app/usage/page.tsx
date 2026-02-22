import { createClient } from '@/lib/supabase/server';
import { GlassCard } from '@/components/ui/glass-card';

export default async function UsagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: licenses } = await supabase
    .from('licenses')
    .select('id')
    .eq('user_id', user.id);
  const licenseIds = (licenses ?? []).map((l) => l.id);

  let logs: { amount: number; action: string | null; created_at: string }[] = [];
  if (licenseIds.length > 0) {
    const { data } = await supabase
      .from('credit_logs')
      .select('amount, action, created_at')
      .in('license_id', licenseIds)
      .order('created_at', { ascending: false })
      .limit(20);
    logs = data ?? [];
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Nutzung</h1>

      <GlassCard className="mb-6">
        <h2 className="mb-4 font-semibold">Letzte Credit-Transaktionen</h2>
        {logs.length === 0 ? (
          <p className="text-white/70">Noch keine Einträge.</p>
        ) : (
          <ul className="space-y-2">
            {logs.map((log, i) => (
              <li
                key={i}
                className="flex justify-between rounded bg-white/5 px-3 py-2 text-sm"
              >
                <span>
                  {log.amount > 0 ? '+' : ''}{log.amount} {log.action ?? '—'}
                </span>
                <span className="text-white/60">
                  {new Date(log.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
