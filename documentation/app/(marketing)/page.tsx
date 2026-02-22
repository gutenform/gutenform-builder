'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { AnimatedSection } from '@/components/ui/animated-section';
import { GlowBadge } from '@/components/ui/glow-badge';
import { useAuthSession } from '@/hooks/use-auth-session';

const FEATURES = [
  {
    title: 'KI-Formular-Generator',
    description: 'Beschreibe dein Formular – die KI baut es in Sekunden.',
    icon: '✨',
  },
  {
    title: 'Gutenberg-Integration',
    description: 'Blöcke direkt im WordPress-Editor nutzen.',
    icon: '🧩',
  },
  {
    title: 'Credits & Lizenzen',
    description: 'Transparente Nutzung und Lizenzschlüssel pro Domain.',
    icon: '🔑',
  },
  {
    title: 'Marketplace',
    description: 'Add-ons und Vorlagen erweitern dein Formular.',
    icon: '🛒',
  },
  {
    title: 'Dashboard',
    description: 'Übersicht über Keys, Billing und Nutzung.',
    icon: '📊',
  },
  {
    title: 'API für Entwickler',
    description: 'Dokumentierte API für eigene Integrationen.',
    icon: '⚡',
  },
];

const TESTIMONIALS = [
  { quote: 'Endlich Formulare ohne manuelles Klicken.', author: 'Platzhalter' },
  { quote: 'Die KI spart uns Stunden pro Woche.', author: 'Platzhalter' },
];

const PRICING_TIERS = [
  { name: 'Free', desc: 'Einstieg', cta: 'Kostenlos starten' },
  { name: 'Pro', desc: 'Mehr Credits', cta: 'Pro wählen', highlight: true },
  { name: 'Agency', desc: 'Für Teams', cta: 'Agency wählen' },
];

export default function MarketingHomePage() {
  const { signedIn } = useAuthSession();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-600/10" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlowBadge className="mb-6">KI-gestützt</GlowBadge>
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
              Formulare bauen{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                mit KI
              </span>
            </h1>
            <p className="mb-10 text-xl text-white/70">
              Erstelle Formulare in Minuten – mit dem Gutenform WordPress-Plugin und KI.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <GradientButton href={signedIn ? '/app' : '/signup'} variant="primary">
                {signedIn ? 'Zum Dashboard' : 'Kostenlos starten'}
              </GradientButton>
              <GradientButton href="/docs" variant="secondary">
                Docs
              </GradientButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <AnimatedSection className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">Features</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <GlassCard key={f.title} glow={i === 1}>
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-4 text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-white/70">{f.description}</p>
            </GlassCard>
          ))}
        </div>
      </AnimatedSection>

      {/* Testimonials */}
      <AnimatedSection className="mx-auto max-w-6xl px-4 py-20" delay={0.1}>
        <h2 className="mb-12 text-center text-3xl font-bold">Stimmen</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <GlassCard key={t.author}>
              <p className="text-white/90">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-2 text-sm text-white/50">— {t.author}</p>
            </GlassCard>
          ))}
        </div>
      </AnimatedSection>

      {/* Pricing Preview */}
      <AnimatedSection className="mx-auto max-w-6xl px-4 py-20" delay={0.15}>
        <h2 className="mb-12 text-center text-3xl font-bold">Pläne</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <GlassCard key={tier.name} glow={tier.highlight}>
              <h3 className="text-xl font-semibold">{tier.name}</h3>
              <p className="mt-2 text-white/70">{tier.desc}</p>
            <Link
              href={signedIn ? (tier.name === 'Free' ? '/app' : '/app/billing') : '/signup'}
              className="mt-6 inline-block rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20"
            >
              {signedIn ? (tier.name === 'Free' ? 'Zum Dashboard' : 'Credits kaufen') : tier.cta}
            </Link>
            </GlassCard>
          ))}
        </div>
      </AnimatedSection>

      {/* CTA */}
      <AnimatedSection className="px-4 py-24" delay={0.2}>
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 p-12 text-center backdrop-blur-xl">
          <h2 className="mb-4 text-3xl font-bold">Bereit, mit KI zu starten?</h2>
          <p className="mb-8 text-white/70">
            Registriere dich kostenlos und generiere dein erstes Formular.
          </p>
          <GradientButton href={signedIn ? '/app' : '/signup'} variant="primary">
            {signedIn ? 'Zum Dashboard' : 'Jetzt starten'}
          </GradientButton>
        </div>
      </AnimatedSection>
    </div>
  );
}
