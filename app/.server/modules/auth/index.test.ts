import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import {
  checkIsValidSessionInTokenPayload,
  generateAccessToken,
  generateRefreshToken,
  getSessionExpirationDate,
  verifyTokenClaims,
} from './index';
import { verifyJwt } from '~/.server/utils/jwt';
import { getAuthSessionById } from './models/session';

vi.mock(
  './models/session.ts', // NOTE: must mock the actual module, not the re-exported one
  async (actual) => {
    return {
      __esmodule: true,
      ...((await actual()) as any),
      getAuthSessionById: vi.fn(),
    };
  },
);

afterEach(() => {
  vi.resetAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
});

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

describe('verifyTokenClaims()', () => {
  it('should not throw if token payload is valid', async () => {
    await expect(
      verifyTokenClaims({
        tokenPayload: {
          payload: { sessionId: 'any', user: { id: 'any', email: 'any' } },
          type: 'access_token',
          azp: import.meta.env.PUBLIC_ORIGIN,
        },
      }),
    ).resolves.not.toThrow();
  });

  it("should not throw if token payload is valid & `azp` claim won't be checked if not provided", async () => {
    await expect(
      verifyTokenClaims({
        tokenPayload: {
          payload: { sessionId: 'any', user: { id: 'any', email: 'any' } },
          type: 'access_token',
          // missing `azp` claim
        },
      }),
    ).resolves.not.toThrow();
  });

  it('should throw Error if `exp` claim is invalid (token expired)', async () => {
    await expect(
      verifyTokenClaims({
        tokenPayload: {
          payload: { sessionId: '1', user: { id: '1', email: '1' } },
          type: 'access_token',
          azp: 'invalid origin',
          exp: Math.floor(Date.now() / 1000) - 2,
        },
      }),
    ).rejects.toThrow(Error);
  });

  it('should throw Error if `azp` claim exists but is NOT valid', async () => {
    await expect(
      verifyTokenClaims({
        tokenPayload: {
          payload: { sessionId: '1', user: { id: '1', email: '1' } },
          type: 'access_token',
          azp: 'invalid origin',
          exp: Math.floor(Date.now() / 1000) + 2,
        },
      }),
    ).rejects.toThrow(Error);
  });
});

describe('checkIsValidSessionInTokenPayload()', () => {
  it('should return true if session is valid', async () => {
    if (vi.isMockFunction(getAuthSessionById))
      getAuthSessionById.mockImplementation(
        () =>
          ({
            id: BigInt('1'),
            userId: BigInt('1'),
            createdAt: new Date(),
            expiredAt: new Date(2099, 0, 1),
            updatedAt: null,
          }) satisfies Awaited<ReturnType<typeof getAuthSessionById>>,
      );

    await expect(
      checkIsValidSessionInTokenPayload({ tokenPayload: { payload: { sessionId: '1', user: { id: '1' } } } }),
    ).resolves.toBe(true);
  });
});
