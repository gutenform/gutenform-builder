import { cn } from '@/lib/utils';

interface GlowBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function GlowBadge({ children, className }: GlowBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-white/90',
        className
      )}
    >
      {children}
    </span>
  );
}
