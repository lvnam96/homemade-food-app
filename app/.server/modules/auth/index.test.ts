import { describe, expect, it } from 'vitest';
import { generateAccessToken, generateRefreshToken, getSessionExpirationDate } from './index';
import { verifyJwt } from '~/.server/utils/jwt';

describe('getSessionExpirationDate()', () => {
  it('should return date', () => {
    expect(getSessionExpirationDate()).toBeInstanceOf(Date);
  });

  it('should return date in the future', () => {
    const expirationDate = getSessionExpirationDate();
    expect(expirationDate.getTime()).toBeGreaterThan(Date.now());
  });

  it('should return date far enough in the future', () => {
    const expirationDate = getSessionExpirationDate();
    expect(expirationDate.getTime()).toBeGreaterThan(Date.now() + 30 * 60 * 1000); // at least 30 minutes
  });
});

describe('generateAccessToken()', () => {
  it('should return JWT as string', async () => {
    const token = await generateAccessToken({ sessionId: '1', user: { id: '1', email: '1' } });
    expect(typeof token).toBe('string');
    await expect(verifyJwt(token)).resolves.not.toThrow();
  });
});

describe('generateRefreshToken()', () => {
  it('should return JWT as string', async () => {
    const token = await generateRefreshToken({ sessionId: '1', user: { id: '1', email: '1' } });
    expect(typeof token).toBe('string');
    await expect(verifyJwt(token)).resolves.not.toThrow();
  });
});
