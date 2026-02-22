'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/glass-card';

export default function AccountPage() {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteStep2, setDeleteStep2] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setFullName(data?.full_name ?? '');
          setLoading(false);
        });
    });
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
    }
    setSaving(false);
  }

  async function handleExport() {
    setExporting(true);
    const res = await fetch('/api/account/export');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gutenform-data-export.json';
    a.click();
    URL.revokeObjectURL(a.href);
    setExporting(false);
  }

  async function handleDelete() {
    if (!deleteStep2) return;
    await fetch('/api/account/delete', { method: 'POST' });
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  if (loading) return <p className="text-white/70">Laden…</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Account</h1>

      <GlassCard className="mb-6">
        <h2 className="mb-4 font-semibold">Profil</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm text-white/70">
              Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20 disabled:opacity-50"
          >
            {saving ? 'Speichern…' : 'Speichern'}
          </button>
        </form>
      </GlassCard>

      <GlassCard className="mb-6">
        <h2 className="mb-2 font-semibold">Datenexport (DSGVO)</h2>
        <p className="mb-4 text-sm text-white/70">
          Lade deine Daten als JSON herunter.
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20 disabled:opacity-50"
        >
          {exporting ? 'Wird erstellt…' : 'Export starten'}
        </button>
      </GlassCard>

      <GlassCard>
        <h2 className="mb-2 font-semibold text-red-400">Account löschen</h2>
        <p className="mb-4 text-sm text-white/70">
          Alle Daten werden gelöscht. Nicht umkehrbar.
        </p>
        {!deleteConfirm ? (
          <button
            type="button"
            onClick={() => setDeleteConfirm(true)}
            className="rounded-lg border border-red-500/50 px-4 py-2 text-red-400 hover:bg-red-500/10"
          >
            Account löschen
          </button>
        ) : !deleteStep2 ? (
          <div>
            <p className="mb-2 text-sm">Bist du sicher?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="rounded bg-white/10 px-4 py-2 hover:bg-white/20"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => setDeleteStep2(true)}
                className="rounded bg-red-500/20 px-4 py-2 text-red-400"
              >
                Ja, endgültig löschen
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-2 text-sm">Letzte Bestätigung.</p>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Jetzt löschen
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
