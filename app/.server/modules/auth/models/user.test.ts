import { describe, expect, it } from 'vitest';
import { normalizeEmail } from './user';

describe('normalizeEmail()', () => {
  it('should lowercase email', () => {
    expect(normalizeEmail('hElLo@A.com')).toBe('hello@a.com-');
  });

  it('should encode punycode characters', () => {
    expect(normalizeEmail('HelLo@mañana.com')).toBe('hello@maana.com-5qb');
  });
});
