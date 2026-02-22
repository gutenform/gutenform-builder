'use client';

import { AnimatedSection } from '@/components/ui/animated-section';
import { GlassCard } from '@/components/ui/glass-card';

const SECTIONS = [
  {
    title: 'AI Form Builder',
    description:
      'Beschreibe in wenigen Sätzen, was dein Formular können soll. Die KI generiert daraus die passenden Blöcke und Felder – ohne manuelles Zusammenklicken.',
  },
  {
    title: 'Gutenberg Integration',
    description:
      'Gutenform-Blöcke erscheinen direkt im WordPress Block-Editor. Du bearbeitest Formulare wie jede andere Seite – mit Vorschau und responsivem Layout.',
  },
  {
    title: 'Marketplace',
    description:
      'Erweitere dein Formular mit Add-ons und Vorlagen aus dem Marketplace. Von Zahlungen über CRM-Anbindung bis zu speziellen Feldtypen.',
  },
  {
    title: 'Dashboard',
    description:
      'Behalte Credits, Lizenzschlüssel und Nutzung im Blick. Ein Key pro Domain, transparente Abrechnung und Nutzungshistorie.',
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-4 text-center text-4xl font-bold">Features</h1>
      <p className="mb-16 text-center text-xl text-white/70">
        Alles, was du für KI-Formulare brauchst.
      </p>
      <div className="space-y-12">
        {SECTIONS.map((s, i) => (
          <AnimatedSection key={s.title} delay={i * 0.05}>
            <GlassCard>
              <h2 className="text-2xl font-semibold">{s.title}</h2>
              <p className="mt-4 text-white/70">{s.description}</p>
            </GlassCard>
          </AnimatedSection>
        ))}
      </div>
    </div>
  );
}
