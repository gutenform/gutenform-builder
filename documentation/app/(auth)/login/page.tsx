'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function authErrorMessage(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'E-Mail oder Passwort ist falsch. Bitte prüfe deine Eingabe.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Bitte bestätige zuerst deine E-Mail über den Link, den wir dir geschickt haben.';
  }
  return message;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/app';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(authErrorMessage(err.message));
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#12121a] p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">
          Anmelden
        </h1>
        <p className="mb-6 text-[15px] text-white/80">
          Melde dich mit deinem Konto an, um zum Dashboard zu gelangen.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </div>
          )}
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-white">
              E-Mail
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/45 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder="deine@email.de"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-white">
              Passwort
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/45 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#12121a] disabled:opacity-60"
          >
            {loading ? 'Wird angemeldet…' : 'Anmelden'}
          </button>
        </form>
        <p className="mt-6 text-center text-[15px] text-white/80">
          Noch kein Konto?{' '}
          <Link href="/signup" className="font-medium text-indigo-400 underline decoration-indigo-400/50 underline-offset-2 hover:text-indigo-300 hover:decoration-indigo-300">
            Jetzt registrieren
          </Link>
        </p>
        <p className="mt-3 text-center">
          <Link href="/" className="text-sm text-white/60 hover:text-white/90">
            ← Zur Startseite
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
          <div className="text-white/80">Laden…</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
