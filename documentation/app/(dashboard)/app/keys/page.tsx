'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/glass-card';

type License = { id: string; key_prefix: string | null } | null;

export default function KeysPage() {
  const [license, setLicense] = useState<License>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false);
        return;
      }
      supabase
        .from('licenses')
        .select('id, key_prefix')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          setLicense(data);
        })
        .finally(() => setLoading(false));
    });
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch('/api/license/generate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login?redirectTo=/app/keys';
          return;
        }
        setGenerateError(data?.error ?? 'Key konnte nicht erstellt werden.');
        return;
      }
      if (data.key_prefix) {
        setLicense((l) => (l ? { ...l, key_prefix: data.key_prefix } : { id: data.id, key_prefix: data.key_prefix }));
        setShowConfirm(false);
      }
    } catch {
      setGenerateError('Netzwerkfehler. Bitte erneut versuchen.');
    } finally {
      setGenerating(false);
    }
  }

  function copyPrefix() {
    if (license?.key_prefix) {
      navigator.clipboard.writeText(license.key_prefix);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) return <p className="text-white/70">Laden…</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Lizenzschlüssel</h1>

      <GlassCard className="mb-6">
        <h2 className="mb-2 font-semibold">Aktiver Key</h2>
        {license?.key_prefix ? (
          <div className="flex items-center gap-2">
            <code className="rounded bg-white/10 px-2 py-1 font-mono">
              {license.key_prefix}…
            </code>
            <button
              type="button"
              onClick={copyPrefix}
              className="rounded bg-white/10 px-3 py-1 text-sm hover:bg-white/20"
            >
              {copied ? 'Kopiert!' : 'Kopieren'}
            </button>
          </div>
        ) : (
          <p className="text-white/70">Noch kein Key. Generiere einen unten.</p>
        )}
      </GlassCard>

      <GlassCard className="mb-6">
        <h2 className="mb-2 font-semibold">Neuen Key generieren</h2>
        <p className="mb-4 text-sm text-white/70">
          Der alte Key wird ungültig. Nur ein Key pro Konto aktiv.
        </p>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          disabled={generating}
          className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20 disabled:opacity-50"
        >
          {generating ? 'Wird generiert…' : 'Neuen Key generieren'}
        </button>
      </GlassCard>

      {generateError && (
        <p className="mb-4 rounded-lg border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-200">
          {generateError}
        </p>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <GlassCard className="mx-4 max-w-sm p-6">
            <p className="mb-4">Alter Key wird ungültig. Fortfahren?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded bg-white/10 px-4 py-2 hover:bg-white/20"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="rounded bg-red-500/20 px-4 py-2 text-red-400 hover:bg-red-500/30"
              >
                Ja, generieren
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
