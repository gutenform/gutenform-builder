import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import { verifySignature } from '@/lib/lemon-squeezy';

describe('verifySignature', () => {
  const secret = 'test-secret';
  const body = '{"data":{"id":"123"}}';

  it('returns true for valid signature', () => {
    const hmac = crypto.createHmac('sha256', secret);
    const sig = hmac.update(body).digest('hex');
    expect(verifySignature(body, sig, secret)).toBe(true);
  });

  it('returns false for invalid signature', () => {
    expect(verifySignature(body, 'wrong', secret)).toBe(false);
  });

  it('returns false when signature is null', () => {
    expect(verifySignature(body, null, secret)).toBe(false);
  });

  it('returns false when secret is empty', () => {
    expect(verifySignature(body, 'abc', '')).toBe(false);
  });
});
