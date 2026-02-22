import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features',
  description: 'KI-Formular-Generator, Gutenberg, Marketplace und Dashboard.',
};

export default function FeaturesLayout({ children }: { children: ReactNode }) {
  return children;
}
