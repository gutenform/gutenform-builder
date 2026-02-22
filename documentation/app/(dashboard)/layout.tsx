import type { ReactNode } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-white">
      <aside className="flex w-56 flex-col border-r border-white/10 bg-black/20">
        <div className="flex h-16 items-center border-b border-white/10 px-4">
          <Link href="/app" className="font-semibold">
            Gutenform
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <Link
            href="/app"
            className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            href="/app/keys"
            className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white"
          >
            Keys
          </Link>
          <Link
            href="/app/billing"
            className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white"
          >
            Billing
          </Link>
          <Link
            href="/app/usage"
            className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white"
          >
            Usage
          </Link>
          <Link
            href="/app/account"
            className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white"
          >
            Account
          </Link>
        </nav>
        <div className="border-t border-white/10 p-4">
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/60 hover:bg-white/10 hover:text-white"
            >
              Abmelden
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
