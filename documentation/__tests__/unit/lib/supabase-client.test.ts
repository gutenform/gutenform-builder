import { describe, it, expect } from 'vitest';

describe('Supabase client module', () => {
  it('exports createClient function', async () => {
    const mod = await import('@/lib/supabase/client');
    expect(typeof mod.createClient).toBe('function');
  });
});
