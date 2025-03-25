import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import {
  checkIsValidSessionInTokenPayload,
  createNewPairOfTokens,
  createPayloadForNewTokens,
  getSessionExpirationDate,
  verifyTokenClaims,
} from './index';
import { verifyJwt } from '~/.server/utils/jwt';
import { getAuthSessionById } from './models/session';
import { LogicError } from '~/.server/utils/error';

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

describe('createPayloadForNewTokens()', () => {
  it('should return payload in expected format', () => {
    const payload = createPayloadForNewTokens({ sessionId: BigInt('1'), userId: BigInt('1'), email: 'a@a.com' });
    expect(payload).toMatchObject({ sessionId: BigInt('1'), user: { id: BigInt('1'), email: 'a@a.com' } });
  });
});

describe('createNewPairOfTokens()', () => {
  it('should create a pair of tokens', async () => {
    const { accessToken, refreshToken } = await createNewPairOfTokens(
      {
        sessionId: BigInt('1'),
        user: { id: BigInt('1'), email: 'a@a.com' },
      },
      (Date.now() + 10000) / 1000,
    );

    expect(typeof accessToken).toBe('string');
    expect(typeof refreshToken).toBe('string');
    await expect(verifyJwt(accessToken)).resolves.not.toThrow();
    await expect(verifyJwt(refreshToken)).resolves.not.toThrow();
  });

  describe('should throw if expiration time is invalid', async () => {
    it('should throw if expiration time is not a positive number', async () => {
      await expect(
        createNewPairOfTokens(
          {
            sessionId: BigInt('1'),
            user: { id: BigInt('1'), email: 'a@a.com' },
          },
          -1,
        ),
      ).rejects.toThrow();
      await expect(
        createNewPairOfTokens(
          {
            sessionId: BigInt('1'),
            user: { id: BigInt('1'), email: 'a@a.com' },
          },
          // @ts-expect-error Testing invalid argument
          null,
        ),
      ).rejects.toThrow();
      await expect(
        createNewPairOfTokens(
          {
            sessionId: BigInt('1'),
            user: { id: BigInt('1'), email: 'a@a.com' },
          },
          // @ts-expect-error Testing invalid argument
          '1',
        ),
      ).rejects.toThrow();
    });

    it('should throw if expiration time is in the past', async () => {
      await expect(
        createNewPairOfTokens(
          {
            sessionId: BigInt('1'),
            user: { id: BigInt('1'), email: 'a@a.com' },
          },
          Date.now() / 1000 - 1,
        ),
      ).rejects.toThrow(LogicError);
    });

    it('should throw if expiration time is not approximately match expiration time of session in DB', async () => {
      await expect(
        createNewPairOfTokens(
          {
            sessionId: BigInt('1'),
            user: { id: BigInt('1'), email: 'a@a.com' },
          },
          100,
        ),
      ).rejects.toThrow(LogicError);
    });
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
