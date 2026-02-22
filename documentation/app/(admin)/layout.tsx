import type { ReactNode } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
  if (profile?.role !== 'admin') redirect('/app');

  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-white">
      <aside className="flex w-56 flex-col border-r border-red-500/20 bg-black/20">
        <div className="flex h-16 items-center border-b border-red-500/20 px-4">
          <Link href="/admin" className="font-semibold text-red-400">
            Gutenform Admin
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <Link
            href="/admin"
            className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white"
          >
            KPIs
          </Link>
          <Link
            href="/admin/users"
            className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white"
          >
            Users
          </Link>
          <Link
            href="/admin/credits"
            className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white"
          >
            Credits
          </Link>
          <Link
            href="/admin/payments"
            className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white"
          >
            Payments
          </Link>
          <Link
            href="/admin/audit"
            className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white"
          >
            Audit
          </Link>
          <Link
            href="/admin/prompts"
            className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white"
          >
            Prompts
          </Link>
          <Link
            href="/admin/blocks"
            className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white"
          >
            Blocks
          </Link>
          <Link
            href="/admin/webhooks"
            className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white"
          >
            Webhooks
          </Link>
        </nav>
        <div className="mt-auto border-t border-white/10 p-4">
          <Link
            href="/app"
            className="block rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white"
          >
            Zum Dashboard
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
