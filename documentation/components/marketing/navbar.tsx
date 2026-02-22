'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSignedIn(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSignedIn(!!session);
      });
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled ? 'border-white/10 bg-[#0a0a0f]/90 backdrop-blur-xl' : 'border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-semibold text-white">
          Gutenform
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/features" className="text-white/90 hover:text-white">
            Features
          </Link>
          <Link href="/pricing" className="text-white/90 hover:text-white">
            Pricing
          </Link>
          <Link href="/docs" className="text-white/90 hover:text-white">
            Docs
          </Link>
          {signedIn === true ? (
            <>
              <Link
                href="/app"
                className="rounded-lg bg-indigo-500/80 px-4 py-2 font-medium text-white hover:bg-indigo-500"
              >
                Dashboard
              </Link>
              <form action="/api/auth/signout" method="post" className="inline">
                <button
                  type="submit"
                  className="text-white/80 hover:text-white"
                >
                  Abmelden
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white/90 hover:text-white">
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-white/10 px-4 py-2 font-medium text-white hover:bg-white/20"
              >
                Registrieren
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
