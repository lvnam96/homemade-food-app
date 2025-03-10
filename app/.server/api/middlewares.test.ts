import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
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
import { getAuthSessionById } from '../modules/auth';

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

afterEach(() => {
  vi.resetAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
});

const validAccessToken =
  'eyJhbGciOiJIUzUxMiJ9.eyJwYXlsb2FkIjp7InNlc3Npb25JZCI6IjM5IiwidXNlciI6eyJpZCI6IjIxIiwiZW1haWwiOiJleGFtcGxlQGdtYWlsLmNvbSJ9fSwidHlwZSI6ImFjY2Vzc190b2tlbiIsImF6cCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTE3MyIsImlhdCI6MTc0MTM1ODgxMSwiZXhwIjo0ODY1NTYxMjExfQ.jZ91vx6eX6wxMg6sCsbJvKlY4DoYoQJ5Vk26OIwYPBgunInBVhyjkwqSvFCyz_e5Vxm4vn_N3HcVpOpRopa-OA';
// const validRefreshToken = 'eyJhbGciOiJIUzUxMiJ9.eyJwYXlsb2FkIjp7InNlc3Npb25JZCI6IjM5IiwidXNlciI6eyJpZCI6IjIxIiwiZW1haWwiOiJleGFtcGxlQGdtYWlsLmNvbSJ9fSwidHlwZSI6InJlZnJlc2hfdG9rZW4iLCJhenAiOiJodHRwOi8vbG9jYWxob3N0OjUxNzMiLCJpYXQiOjE3NDEzNTg4NTgsImV4cCI6NDg2NTU2MTI1OH0.VLSnEvdTWscsmhhFUgP1XLVKEF7rpvJsXbMVrB_PEQQDVO71VfLcyNeFZhJIZv979oSKQENurSz2LBtLuceM8g';

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
      expiredAt: new Date(),
      updatedAt: null,
    };
    if (vi.isMockFunction(getAuthSessionById)) getAuthSessionById.mockImplementation(() => existingSession);

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
    if (vi.isMockFunction(getAuthSessionById)) getAuthSessionById.mockImplementation(() => undefined);

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
      expiredAt: new Date(),
      updatedAt: null,
    };
    if (vi.isMockFunction(getAuthSessionById)) getAuthSessionById.mockImplementation(() => existingSession);
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
  const existingSession: Awaited<ReturnType<typeof getAuthSessionById>> = {
    id: BigInt('1'),
    userId: BigInt('1'),
    createdAt: new Date(),
    expiredAt: new Date(),
    updatedAt: null,
  };

  it('should do nothing if session is valid', async () => {
    if (vi.isMockFunction(getAuthSessionById)) getAuthSessionById.mockImplementation(() => existingSession);

    await expect(
      requireValidSessionInToken({
        tokenPayload: {
          payload: {
            sessionId: '1',
            user: {
              id: '1',
            },
          },
          type: 'access_token',
        },
      }),
    ).resolves.not.toThrow();
  });
});

describe('requireValidTokenType()', () => {
  it('should do nothing if token type is valid', () => {
    expect(
      requireValidTokenType({
        expectedTokenType: 'access_token',
        tokenType: 'access_token',
      }),
    ).toBeUndefined();
    expect(
      requireValidTokenType({
        expectedTokenType: 'refresh_token',
        tokenType: 'refresh_token',
      }),
    ).toBeUndefined();
  });

  it('should throw Response object if token type is invalid', () => {
    expect(() =>
      requireValidTokenType({
        expectedTokenType: 'access_token',
        tokenType: 'refresh_token',
      }),
    ).toThrow(Response);
    expect(() =>
      requireValidTokenType({
        expectedTokenType: 'refresh_token',
        tokenType: 'access_token',
      }),
    ).toThrow(Response);
  });

  it('should throw Response object if passed token types are not valid', () => {
    // Test invalid `tokenType`:
    expect(() =>
      requireValidTokenType({
        expectedTokenType: 'access_token',
        tokenType: null,
      }),
    ).toThrow(Response);
    expect(() =>
      requireValidTokenType({
        expectedTokenType: 'access_token',
        tokenType: undefined,
      }),
    ).toThrow(Response);

    // Test both invalid `tokenType` and `expectedTokenType` but matching each other:
    expect(() =>
      requireValidTokenType({
        // @ts-expect-error Testing invalid argument
        expectedTokenType: null,
        tokenType: null,
      }),
    ).toThrow(Response);
    expect(() =>
      requireValidTokenType({
        // @ts-expect-error Testing invalid argument
        expectedTokenType: undefined,
        tokenType: undefined,
      }),
    ).toThrow(Response);
    expect(() =>
      requireValidTokenType({
        // @ts-expect-error Testing invalid argument
        expectedTokenType: 'undefined',
        // @ts-expect-error Testing invalid argument
        tokenType: 'undefined',
      }),
    ).toThrow(Response);

    // Test invalid `expectedTokenType`:
    expect(() =>
      requireValidTokenType({
        // @ts-expect-error Testing invalid argument
        expectedTokenType: null,
        tokenType: 'access_token',
      }),
    ).toThrow(Response);
    expect(() =>
      requireValidTokenType({
        // @ts-expect-error Testing invalid argument
        expectedTokenType: undefined,
        tokenType: 'access_token',
      }),
    ).toThrow(Response);
    expect(() =>
      requireValidTokenType({
        // @ts-expect-error Testing invalid argument
        expectedTokenType: 'invalid_token_type',
        tokenType: 'access_token',
      }),
    ).toThrow(Response);
  });
});

describe('requireFormBody()', () => {
  it('should do nothing if request body is regular form data (`application/x-www-form-urlencoded`) or multipart form data (`multipart/form-data`)', async () => {
    const multipartFormData = new FormData();
    multipartFormData.set('foo', 'bar');
    multipartFormData.set('file', new File(['{"hello":"world"}'], 'demo.json', { type: 'application/json' }));
    await expect(
      requireFormBody({
        request: new Request('https://example.com', {
          method: 'POST',
          body: multipartFormData,
        }),
      }),
    ).resolves.not.toThrow();

    const regularFormData = new FormData();
    regularFormData.set('foo', 'bar');
    await expect(
      requireFormBody({
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
      requireFormBody({
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
      requireJsonBody({
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
      requireJsonBody({
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
      requireJsonBody({
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
      requireJsonBody({
        request: new Request('https://example.com', {
          headers: new Headers({
            'Content-Type': 'text/plain',
          }),
        }),
      }),
    ).rejects.toThrow(Response);
    await expect(
      requireJsonBody({
        request: new Request('https://example.com', { headers: new Headers({}) }),
      }),
    ).rejects.toThrow(Response);
    await expect(
      requireJsonBody({
        request: new Request('https://example.com'),
      }),
    ).rejects.toThrow(Response);
  });
});

describe('requireSearchParams()', () => {
  it('should do nothing if request search params exist', async () => {
    await expect(
      requireSearchParams({
        request: new Request('https://example.com?foo=bar'),
      }),
    ).resolves.not.toThrow();
  });

  it('should throw Response object if request search params do not exist', async () => {
    await expect(
      requireSearchParams({
        request: new Request('https://example.com'),
      }),
    ).rejects.toThrow(Response);
    await expect(
      requireSearchParams({
        request: new Request('https://example.com?'),
      }),
    ).rejects.toThrow(Response);
  });
});

describe('requirePathParams()', () => {
  it('should do nothing if request path params exist', async () => {
    await expect(
      requirePathParams({
        params: { id: '1', foo: 'bar' },
        predicate: (params) => (typeof params.id === 'string' && params.id ? null : 'Invalid ID'),
      }),
    ).resolves.not.toThrow();
  });

  it('should throw Response object if path param validation fails', async () => {
    const predicate = (params: Record<string, string | undefined>) =>
      typeof params.id === 'string' && params.id ? null : 'Invalid ID';
    await expect(
      requirePathParams({
        params: {},
        predicate: predicate,
      }),
    ).rejects.toThrow(Response);
    await expect(
      requirePathParams({
        params: { id: '' },
        predicate: predicate,
      }),
    ).rejects.toThrow(Response);
  });
});
