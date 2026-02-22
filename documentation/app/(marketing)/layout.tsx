import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';

export const metadata: Metadata = {
  title: {
    default: 'Gutenform – Formulare bauen mit KI',
    template: '%s | Gutenform',
  },
  description:
    'Erstelle Formulare in Minuten mit dem Gutenform WordPress-Plugin und KI.',
  openGraph: {
    title: 'Gutenform – Formulare bauen mit KI',
    description: 'Erstelle Formulare in Minuten mit dem Gutenform WordPress-Plugin und KI.',
  },
};

export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
