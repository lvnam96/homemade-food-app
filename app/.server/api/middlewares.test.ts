import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getRequestData,
  requireAnonymousUser,
  requireAuthenticatedUser,
  requireFormBody,
  requireJsonBody,
  requirePathParams,
  requireSearchParams,
  requireValidSessionInToken,
  requireValidTokenType,
} from './middlewares';
import { generateAccessToken, generateRefreshToken, getAuthSessionById } from '../modules/auth';
import { getRequestCache } from '../utils/request-cache';

vi.mock(
  '../modules/auth/models/session.ts', // NOTE: must mock the actual module, not the re-exported one
  async (actual) => {
    return {
      __esmodule: true,
      ...((await actual()) as any),
      getAuthSessionById: vi.fn(),
    };
  },
);

// Steps to mock external module (`getRequestCache` in this case) imported to being tested module:
// 1. First, partially mock the module that exports `getRequestCache`
vi.mock(import('../utils/request-cache'), async (actual) => {
  return {
    __esmodule: true,
    ...((await actual()) as any), // rest of exports will get actual implementation
    getRequestCache: vi.fn(),
  };
});
// 2. Then, set actual implementation of `getRequestCache` to mocked one before each test
beforeEach(async () => {
  vi.mocked(getRequestCache).mockImplementation(
    (await vi.importActual<typeof import('../utils/request-cache')>('../utils/request-cache')).getRequestCache,
  );
});
// 3. Finally, mock implementation of `getRequestCache` in specific tests using `vi.mocked(getRequestCache).mockImplementation(...)` (see `requireValidTokenType()` test suite for example)

afterEach(() => {
  vi.resetAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
});

const validAccessToken = await generateAccessToken({
  sessionId: '39',
  user: { id: '21', email: 'example@gmail.com' },
});
const validRefreshToken = await generateRefreshToken({
  sessionId: '39',
  user: { id: '21', email: 'example@gmail.com' },
});

describe('getRequestData()', () => {
  it('should return token and tokenPayload', async () => {
    // implement tests for getRequestData() at `./middlewares.ts`
    const { token, tokenPayload } = await getRequestData({
      request: new Request('https://example.com', {
        headers: new Headers({
          Authorization: 'Bearer ' + validAccessToken,
        }),
      }),
    });

    expect(token).toBe(validAccessToken);
    expect(tokenPayload).toBeTypeOf('object');
    // Roughly check `tokenPayload` format:
    expect(tokenPayload?.type).toBe('access_token');
    expect(tokenPayload?.payload?.sessionId).toBeTypeOf('string');
    expect(tokenPayload?.payload?.user).toBeTypeOf('object');
  });
});

describe('requireAuthenticatedUser()', () => {
  it('should do nothing if user is authenticated', async () => {
    const existingSession: Awaited<ReturnType<typeof getAuthSessionById>> = {
      id: BigInt('39'),
      userId: BigInt('21'),
      createdAt: new Date(),
      expiredAt: new Date(2099, 0, 1),
      updatedAt: null,
    };
    if (vi.isMockFunction(getAuthSessionById)) getAuthSessionById.mockImplementation(async () => existingSession);

    await expect(
      requireAuthenticatedUser({
        request: new Request('https://example.com', {
          headers: new Headers({
            Authorization: 'Bearer ' + validAccessToken,
          }),
        }),
      }),
    ).resolves.not.toThrow();
  });

  it('should throw Response object if user is not authenticated', async () => {
    // Expect error to be thrown when verifying token fails:
    await expect(
      requireAuthenticatedUser({
        request: new Request('https://example.com', {
          headers: new Headers({
            Authorization: 'Bearer invalid.jwt',
          }),
        }),
      }),
    ).rejects.toThrow(Error);
  });
});

describe('requireAnonymousUser()', () => {
  it('should do nothing if user is anonymous', async () => {
    await expect(
      requireAnonymousUser({
        request: new Request('https://example.com'),
      }),
    ).resolves.not.toThrow();
  });

  it('should throw Response object if user request is sent with any bearer token, not matter valid or invalid', async () => {
    if (vi.isMockFunction(getAuthSessionById)) getAuthSessionById.mockImplementation(async () => undefined);

    // Expect error to be thrown when verifying token fails:
    await expect(
      requireAnonymousUser({
        request: new Request('https://example.com', {
          headers: new Headers({
            Authorization: 'Bearer invalid.jwt',
          }),
        }),
      }),
    ).rejects.toThrow(Error);

    const existingSession: Awaited<ReturnType<typeof getAuthSessionById>> = {
      id: BigInt('39'),
      userId: BigInt('21'),
      createdAt: new Date(),
      expiredAt: new Date(2099, 0, 1),
      updatedAt: null,
    };
    if (vi.isMockFunction(getAuthSessionById)) getAuthSessionById.mockImplementation(async () => existingSession);
    await expect(
      requireAnonymousUser({
        request: new Request('https://example.com', {
          headers: new Headers({
            Authorization: 'Bearer ' + validAccessToken,
          }),
        }),
      }),
    ).rejects.toThrow(Response);
  });
});

describe('requireValidSessionInToken()', () => {
  it('should do nothing if session is valid', async () => {
    const existingSession: Awaited<ReturnType<typeof getAuthSessionById>> = {
      id: BigInt('2'),
      userId: BigInt('21'),
      createdAt: new Date(),
      expiredAt: new Date(2099, 0, 1),
      updatedAt: null,
    };
    if (vi.isMockFunction(getAuthSessionById)) getAuthSessionById.mockImplementation(async () => existingSession);

    await expect(
      requireValidSessionInToken({
        request: new Request('https://example.com', {
          headers: new Headers({
            Authorization: 'Bearer ' + validAccessToken,
          }),
        }),
      }),
    ).resolves.not.toThrow();
  });
});

describe('requireValidTokenType()', () => {
  const cacheGetFn = vi.fn();
  const cacheHasFn = vi.fn();

  it('should do nothing if token type is valid', async () => {
    await expect(
      requireValidTokenType({
        expectedTokenType: 'access_token',
      })({
        request: new Request('https://example.com', {
          headers: new Headers({ Authorization: 'Bearer ' + validAccessToken }),
        }),
      }),
    ).resolves.toBeUndefined();

    await expect(
      requireValidTokenType({
        expectedTokenType: 'refresh_token',
      })({
        request: new Request('https://example.com', {
          headers: new Headers({ Authorization: 'Bearer ' + validRefreshToken }),
        }),
      }),
    ).resolves.toBeUndefined();
  });

  it('should throw Response object if token type is invalid', async () => {
    await expect(
      requireValidTokenType({
        expectedTokenType: 'access_token',
      })({
        request: new Request('https://example.com', {
          headers: new Headers({ Authorization: 'Bearer ' + validRefreshToken }),
        }),
      }),
    ).rejects.toThrow(Response);

    await expect(
      requireValidTokenType({
        expectedTokenType: 'refresh_token',
      })({
        request: new Request('https://example.com', {
          headers: new Headers({ Authorization: 'Bearer ' + validAccessToken }),
        }),
      }),
    ).rejects.toThrow(Response);
  });

  it('should throw Response object if passed token types are not valid', async () => {
    vi.mocked(getRequestCache).mockImplementation(() => ({
      get: cacheGetFn,
      has: cacheHasFn.mockImplementation(() => true),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    }));
    const emptyRequest = new Request('https://example.com');

    // Test invalid `tokenType`:
    cacheGetFn.mockReturnValue({
      type: null,
    });
    await expect(
      requireValidTokenType({
        expectedTokenType: 'access_token',
      })({
        request: emptyRequest,
      }),
    ).rejects.toThrow(Response);

    cacheGetFn.mockReturnValue({
      type: undefined,
    });
    await expect(() =>
      requireValidTokenType({
        expectedTokenType: 'access_token',
      })({
        request: emptyRequest,
      }),
    ).rejects.toThrow(Response);

    // Test both invalid `tokenType` and `expectedTokenType` but matching each other:
    cacheGetFn.mockReturnValue({
      type: null,
    });
    await expect(
      requireValidTokenType({
        // @ts-expect-error Testing invalid argument
        expectedTokenType: null,
      })({
        request: emptyRequest,
      }),
    ).rejects.toThrow(Response);

    cacheGetFn.mockReturnValue({
      type: undefined,
    });
    await expect(
      requireValidTokenType({
        // @ts-expect-error Testing invalid argument
        expectedTokenType: undefined,
      })({
        request: emptyRequest,
      }),
    ).rejects.toThrow(Response);

    cacheGetFn.mockReturnValue({
      type: 'invalid_type',
    });
    await expect(
      requireValidTokenType({
        // @ts-expect-error Testing invalid argument
        expectedTokenType: 'invalid_type',
      })({
        request: emptyRequest,
      }),
    ).rejects.toThrow(Response);
  });

  it('should throw Response object if expected token type is invalid', async () => {
    const validAuthedRequest = new Request('https://example.com', {
      headers: new Headers({ Authorization: 'Bearer ' + validAccessToken }),
    });

    await expect(
      requireValidTokenType({
        // @ts-expect-error Testing invalid argument
        expectedTokenType: null,
      })({
        request: validAuthedRequest,
      }),
    ).rejects.toThrow(Response);
    await expect(
      requireValidTokenType({
        // @ts-expect-error Testing invalid argument
        expectedTokenType: undefined,
      })({
        request: validAuthedRequest,
      }),
    ).rejects.toThrow(Response);
    await expect(
      requireValidTokenType({
        // @ts-expect-error Testing invalid argument
        expectedTokenType: 'invalid_token_type',
      })({
        request: validAuthedRequest,
      }),
    ).rejects.toThrow(Response);
  });
});

describe('requireFormBody()', () => {
  it('should do nothing if request body is regular form data (`application/x-www-form-urlencoded`) or multipart form data (`multipart/form-data`)', async () => {
    const multipartFormData = new FormData();
    multipartFormData.set('foo', 'bar');
    multipartFormData.set('file', new File(['{"hello":"world"}'], 'demo.json', { type: 'application/json' }));
    await expect(
      requireFormBody()({
        request: new Request('https://example.com', {
          method: 'POST',
          body: multipartFormData,
        }),
      }),
    ).resolves.not.toThrow();

    const regularFormData = new FormData();
    regularFormData.set('foo', 'bar');
    await expect(
      requireFormBody()({
        request: new Request('https://example.com', {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
          body: regularFormData,
        }),
      }),
    ).resolves.not.toThrow();
    await expect(
      requireFormBody()({
        request: new Request('https://example.com', {
          method: 'POST',
          // without manually setting `Content-Type: application/x-www-form-urlencoded` header
          body: regularFormData,
        }),
      }),
    ).resolves.not.toThrow();
  });
});

describe('requireJsonBody()', () => {
  it('should do nothing if request body is JSON', async () => {
    await expect(
      requireJsonBody()({
        request: new Request('https://example.com', {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({}),
        }),
      }),
    ).resolves.not.toThrow();
  });

  it('should throw Response object if request body is not JSON even though `Content-Type` header is `application/json`', async () => {
    await expect(
      requireJsonBody()({
        request: new Request('https://example.com', {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
          body: '',
        }),
      }),
    ).rejects.toThrow(SyntaxError);
  });

  it('should throw Response object if request method is GET even though `Content-Type` header is `application/json`', async () => {
    await expect(
      requireJsonBody()({
        request: new Request('https://example.com', {
          method: 'GET',
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
        }),
      }),
    ).rejects.toThrow(SyntaxError);
  });

  it('should throw Response object if `Content-Type` header is not `application/json`', async () => {
    await expect(
      requireJsonBody()({
        request: new Request('https://example.com', {
          headers: new Headers({
            'Content-Type': 'text/plain',
          }),
        }),
      }),
    ).rejects.toThrow(Response);
    await expect(
      requireJsonBody()({
        request: new Request('https://example.com', { headers: new Headers({}) }),
      }),
    ).rejects.toThrow(Response);
    await expect(
      requireJsonBody()({
        request: new Request('https://example.com'),
      }),
    ).rejects.toThrow(Response);
  });
});

describe('requireSearchParams()', () => {
  it('should do nothing if request search params exist', async () => {
    await expect(
      requireSearchParams()({
        request: new Request('https://example.com?foo=bar'),
      }),
    ).resolves.not.toThrow();
  });

  it('should throw Response object if request search params do not exist', async () => {
    await expect(
      requireSearchParams()({
        request: new Request('https://example.com'),
      }),
    ).rejects.toThrow(Response);
    await expect(
      requireSearchParams()({
        request: new Request('https://example.com?'),
      }),
    ).rejects.toThrow(Response);
  });
});

describe('requirePathParams()', () => {
  it('should do nothing if request path params exist', async () => {
    await expect(
      requirePathParams({
        predicate: (params) => (typeof params.id === 'string' && params.id ? null : 'Invalid ID'),
      })({
        params: { id: '1', foo: 'bar' },
      }),
    ).resolves.not.toThrow();
  });

  it('should throw Response object if path param validation fails', async () => {
    const predicate = (params: Record<string, string | undefined>) =>
      typeof params.id === 'string' && params.id ? null : 'Invalid ID';
    await expect(
      requirePathParams({
        predicate,
      })({
        params: {},
      }),
    ).rejects.toThrow(Response);
    await expect(
      requirePathParams({
        predicate,
      })({
        params: { id: '' },
      }),
    ).rejects.toThrow(Response);
  });
});
