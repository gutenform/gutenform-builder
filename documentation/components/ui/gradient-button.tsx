import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface GradientButtonProps {
  children: ReactNode;
  href?: string;
  className?: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export function GradientButton({
  children,
  href,
  className,
  variant = 'primary',
  onClick,
  type = 'button',
}: GradientButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 hover:shadow-glow';
  const variants = {
    primary:
      'bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-white hover:from-indigo-400 hover:to-purple-500',
    secondary:
      'border border-white/20 bg-white/5 px-6 py-3 text-white hover:bg-white/10',
  };
  const styles = cn(base, variants[variant], className);

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={styles} onClick={onClick}>
      {children}
    </button>
  );
}
