'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { useAuthSession } from '@/hooks/use-auth-session';

const PLANS = [
  {
    name: 'Free',
    monthly: '0',
    yearly: '0',
    desc: 'Einstieg mit begrenzten Credits.',
    features: ['Basis-Credits', '1 Lizenz', 'Community-Support'],
  },
  {
    name: 'Pro',
    monthly: '19',
    yearly: '15',
    desc: 'Mehr Credits und Features.',
    features: ['Mehr Credits', 'Mehr Lizenzen', 'Prioritäts-Support'],
    highlight: true,
  },
  {
    name: 'Agency',
    monthly: '49',
    yearly: '39',
    desc: 'Für Agenturen und Teams.',
    features: ['Hohe Credits', 'Unbegrenzte Lizenzen', 'Dedizierter Support'],
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const { signedIn } = useAuthSession();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-4 text-center text-4xl font-bold">Pricing</h1>
      <p className="mb-10 text-center text-white/70">
        Wähle den Plan, der zu dir passt.
      </p>

      <div className="mb-12 flex justify-center gap-2">
        <span className={!yearly ? 'text-white' : 'text-white/50'}>Monatlich</span>
        <button
          type="button"
          role="switch"
          aria-checked={yearly}
          onClick={() => setYearly((v) => !v)}
          className="relative h-6 w-11 rounded-full bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 data-[state=checked]:bg-indigo-500"
          style={{ backgroundColor: yearly ? 'rgb(99 102 241)' : 'rgba(255,255,255,0.2)' }}
        >
          <span
            className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform"
            style={{ transform: yearly ? 'translateX(20px)' : 'translateX(0)' }}
          />
        </button>
        <span className={yearly ? 'text-white' : 'text-white/50'}>Jährlich</span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <GlassCard key={plan.name} glow={plan.highlight}>
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="mt-2 text-white/70">{plan.desc}</p>
            <p className="mt-4">
              <span className="text-3xl font-bold">
                €{yearly ? plan.yearly : plan.monthly}
              </span>
              <span className="text-white/60">/Monat</span>
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/80">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <GradientButton
              href={signedIn ? (plan.name === 'Free' ? '/app' : '/app/billing') : '/signup'}
              variant={plan.highlight ? 'primary' : 'secondary'}
              className="mt-8 w-full"
            >
              {signedIn
                ? (plan.name === 'Free' ? 'Zum Dashboard' : 'Credits kaufen')
                : plan.name === 'Free'
                  ? 'Kostenlos starten'
                  : `${plan.name} wählen`}
            </GradientButton>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
