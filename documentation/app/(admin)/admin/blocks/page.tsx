'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/glass-card';

type Block = { id: string; block_slug: string; description: string | null; attributes_schema: unknown };

export default function AdminBlocksPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [json, setJson] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('block_definitions')
      .select('id, block_slug, description, attributes_schema')
      .then(({ data }) => {
        setBlocks(data ?? []);
        setLoading(false);
      });
  }, []);

  function startEdit(b: Block) {
    setEditing(b.id);
    setJson(JSON.stringify(b.attributes_schema ?? {}, null, 2));
  }

  async function saveEdit(id: string) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      alert('Ungültiges JSON');
      return;
    }
    const supabase = createClient();
    await supabase.from('block_definitions').update({ attributes_schema: parsed }).eq('id', id);
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, attributes_schema: parsed } : b)));
    setEditing(null);
  }

  if (loading) return <p className="text-white/70">Laden…</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Block Definitions</h1>
      <GlassCard>
        <p className="mb-4 text-sm text-white/70">
          JSON-Schema der Blöcke, die die KI kennt.
        </p>
        {blocks.length === 0 ? (
          <p className="text-white/60">Keine Block-Definitionen.</p>
        ) : (
          <div className="space-y-4">
            {blocks.map((b) => (
              <div key={b.id} className="rounded border border-white/10 bg-black/20 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <code className="font-mono text-sm">{b.block_slug}</code>
                  {editing !== b.id ? (
                    <button
                      type="button"
                      onClick={() => startEdit(b)}
                      className="rounded bg-white/10 px-3 py-1 text-sm hover:bg-white/20"
                    >
                      Bearbeiten
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => saveEdit(b.id)}
                      className="rounded bg-indigo-600 px-3 py-1 text-sm hover:bg-indigo-700"
                    >
                      Speichern
                    </button>
                  )}
                </div>
                {editing === b.id ? (
                  <textarea
                    value={json}
                    onChange={(e) => setJson(e.target.value)}
                    className="h-48 w-full rounded border border-white/10 bg-white/5 p-2 font-mono text-sm text-white"
                    spellCheck={false}
                  />
                ) : (
                  <pre className="max-h-32 overflow-auto text-xs text-white/80">
                    {JSON.stringify(b.attributes_schema, null, 2)}
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
