import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a0f] text-white">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-white/70">Seite nicht gefunden.</p>
      <Link
        href="/"
        className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20"
      >
        Zur Startseite
      </Link>
    </div>
  );
}
