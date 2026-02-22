import { createClient } from '@/lib/supabase/server';
import { GlassCard } from '@/components/ui/glass-card';

export default async function AdminAuditPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('id, actor_id, action, target_type, target_id, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Audit Log</h1>
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-2 pr-4">Aktion</th>
                <th className="py-2 pr-4">Target</th>
                <th className="py-2 pr-4">Actor</th>
                <th className="py-2">Datum</th>
              </tr>
            </thead>
            <tbody>
              {(logs ?? []).map((log) => (
                <tr key={log.id} className="border-b border-white/5">
                  <td className="py-2 pr-4 font-medium">{log.action}</td>
                  <td className="py-2 pr-4 text-white/80">
                    {log.target_type ?? '—'} {log.target_id ? `(${String(log.target_id).slice(0, 8)}…)` : ''}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-white/60">
                    {log.actor_id ? String(log.actor_id).slice(0, 8) + '…' : '—'}
                  </td>
                  <td className="py-2 text-white/60">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!logs || logs.length === 0) && (
          <p className="py-4 text-white/60">Keine Einträge.</p>
        )}
      </GlassCard>
    </div>
  );
}
