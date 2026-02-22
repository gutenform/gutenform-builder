'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a0f] px-4 text-white">
      <h1 className="text-xl font-bold">Etwas ist schiefgelaufen</h1>
      <p className="text-center text-white/70">
        Ein unerwarteter Fehler ist aufgetreten.
      </p>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20"
        >
          Erneut versuchen
        </button>
        <Link
          href="/"
          className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/5"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
