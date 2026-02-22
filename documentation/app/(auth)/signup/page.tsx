'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function authErrorMessage(message: string): string {
  if (message.includes('already registered')) {
    return 'Diese E-Mail ist bereits registriert. Melde dich an oder setze dein Passwort zurück.';
  }
  return message;
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/callback?next=/app` },
    });
    setLoading(false);
    if (err) {
      setError(authErrorMessage(err.message));
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#12121a] p-8 shadow-xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">
            E-Mail bestätigen
          </h1>
          <p className="mb-6 text-[15px] leading-relaxed text-white/90">
            Wir haben dir eine E-Mail an <strong className="text-white">{email}</strong> geschickt.
            Bitte klicke auf den Bestätigungslink in der E-Mail, um dein Konto zu aktivieren.
          </p>
          <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4 text-left text-sm text-white/80">
            <p className="font-medium text-white/90">So geht es weiter:</p>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>Postfach (und ggf. Spam-Ordner) öffnen</li>
              <li>E-Mail von Gutenform öffnen</li>
              <li>Auf „E-Mail bestätigen“ klicken</li>
              <li>Anschließend hier anmelden</li>
            </ol>
          </div>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#12121a]"
          >
            Zum Login
          </Link>
          <p className="mt-4 text-sm text-white/60">
            Keine E-Mail erhalten? Prüfe den Spam-Ordner oder{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
              erneut anfordern
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#12121a] p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">
          Konto erstellen
        </h1>
        <p className="mb-6 text-[15px] text-white/80">
          Registriere dich, um das Dashboard und deine Lizenzschlüssel zu nutzen.
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
            <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-white">
              E-Mail
            </label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-white">
              Passwort
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/45 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder="Mindestens 6 Zeichen"
            />
            <p className="mt-1 text-xs text-white/55">Mindestens 6 Zeichen</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#12121a] disabled:opacity-60"
          >
            {loading ? 'Konto wird erstellt…' : 'Konto erstellen'}
          </button>
        </form>
        <p className="mt-6 text-center text-[15px] text-white/80">
          Bereits ein Konto?{' '}
          <Link href="/login" className="font-medium text-indigo-400 underline decoration-indigo-400/50 underline-offset-2 hover:text-indigo-300 hover:decoration-indigo-300">
            Jetzt anmelden
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
