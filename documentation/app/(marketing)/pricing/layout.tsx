import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Pläne und Preise für Gutenform.',
};

export default function PricingLayout({ children }: { children: ReactNode }) {
  return children;
}
