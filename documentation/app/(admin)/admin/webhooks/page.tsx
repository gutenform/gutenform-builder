'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/glass-card';

type WebhookEvent = {
  id: string;
  source: string;
  event_id: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
};

export default function AdminWebhooksPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('webhook_events')
      .select('id, source, event_id, status, error_message, created_at')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setEvents((data as WebhookEvent[]) ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-white/70">Laden…</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Webhooks</h1>
      <GlassCard>
        <p className="mb-4 text-sm text-white/70">
          Fehlgeschlagene Events können im Backend manuell erneut verarbeitet werden (Retry).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-2 pr-4">Event ID</th>
                <th className="py-2 pr-4">Source</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Fehler</th>
                <th className="py-2">Datum</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-white/5">
                  <td className="py-2 pr-4 font-mono text-xs">{e.event_id ?? '—'}</td>
                  <td className="py-2 pr-4">{e.source}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={
                        e.status === 'failed'
                          ? 'text-red-400'
                          : e.status === 'processed'
                            ? 'text-green-400'
                            : 'text-white/80'
                      }
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="max-w-xs truncate py-2 pr-4 text-white/60">
                    {e.error_message ?? '—'}
                  </td>
                  <td className="py-2 text-white/60">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {events.length === 0 && (
          <p className="py-4 text-white/60">Keine Webhook-Events.</p>
        )}
      </GlassCard>
    </div>
  );
}
