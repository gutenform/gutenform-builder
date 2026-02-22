import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlassCard } from '@/components/ui/glass-card';

describe('GlassCard', () => {
  it('renders children', () => {
    render(<GlassCard>Hello</GlassCard>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies glass-panel class', () => {
    const { container } = render(<GlassCard>Hi</GlassCard>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('glass-panel');
  });
});
