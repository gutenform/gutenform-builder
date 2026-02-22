import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-white/60">© Gutenform</span>
          <div className="flex gap-6">
            <Link href="/impressum" className="text-white/60 hover:text-white">
              Impressum
            </Link>
            <Link href="/datenschutz" className="text-white/60 hover:text-white">
              Datenschutz
            </Link>
            <Link href="/docs" className="text-white/60 hover:text-white">
              Dokumentation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
