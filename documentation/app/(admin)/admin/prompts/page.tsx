'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/glass-card';

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<{ id: string; name: string; prompt_text: string; is_active: boolean }[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('system_prompts')
      .select('id, name, prompt_text, is_active')
      .then(({ data }) => {
        setPrompts(data ?? []);
        const active = (data ?? []).find((p) => p.is_active);
        if (active) setActiveId(active.id);
        setLoading(false);
      });
  }, []);

  async function setActive(id: string) {
    const supabase = createClient();
    await supabase.from('system_prompts').update({ is_active: false }).neq('id', id);
    await supabase.from('system_prompts').update({ is_active: true }).eq('id', id);
    setActiveId(id);
  }

  async function saveEdit(id: string) {
    const supabase = createClient();
    await supabase.from('system_prompts').update({ prompt_text: text }).eq('id', id);
    setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, prompt_text: text } : p)));
    setEditing(null);
  }

  if (loading) return <p className="text-white/70">Laden…</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Prompts</h1>
      <GlassCard className="mb-6">
        <p className="mb-4 text-sm text-white/70">
          System-Prompt für die KI. Nur ein Prompt kann aktiv sein.
        </p>
        {prompts.length === 0 ? (
          <p className="text-white/60">Keine Prompts. Erstelle einen in der DB (system_prompts).</p>
        ) : (
          <div className="space-y-4">
            {prompts.map((p) => (
              <div key={p.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{p.name}</span>
                  <div className="flex gap-2">
                    {activeId !== p.id && (
                      <button
                        type="button"
                        onClick={() => setActive(p.id)}
                        className="rounded bg-white/10 px-3 py-1 text-sm hover:bg-white/20"
                      >
                        Aktivieren
                      </button>
                    )}
                    {activeId === p.id && (
                      <span className="text-sm text-green-400">Aktiv</span>
                    )}
                    {editing !== p.id ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(p.id);
                          setText(p.prompt_text);
                        }}
                        className="rounded bg-white/10 px-3 py-1 text-sm hover:bg-white/20"
                      >
                        Bearbeiten
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => saveEdit(p.id)}
                        className="rounded bg-indigo-600 px-3 py-1 text-sm hover:bg-indigo-700"
                      >
                        Speichern
                      </button>
                    )}
                  </div>
                </div>
                {editing === p.id ? (
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="h-40 w-full rounded border border-white/10 bg-white/5 p-2 font-mono text-sm text-white"
                    rows={10}
                  />
                ) : (
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words text-sm text-white/80">
                    {p.prompt_text}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
