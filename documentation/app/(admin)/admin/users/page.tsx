import { createClient } from '@/lib/supabase/server';
import { GlassCard } from '@/components/ui/glass-card';
import Link from 'next/link';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">User Management</h1>
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Rolle</th>
                <th className="py-2 pr-4">Erstellt</th>
                <th className="py-2">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {(profiles ?? []).map((p) => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="py-2 pr-4 text-white/90">{p.email ?? '—'}</td>
                  <td className="py-2 pr-4 text-white/80">{p.full_name ?? '—'}</td>
                  <td className="py-2 pr-4 capitalize text-white/80">{p.role}</td>
                  <td className="py-2 pr-4 text-white/60">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-2">
                    <span className="text-white/50">Ban, Gift Credits (Sprint 5 UI)</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!profiles || profiles.length === 0) && (
          <p className="py-4 text-white/60">Keine Nutzer.</p>
        )}
      </GlassCard>
    </div>
  );
}
