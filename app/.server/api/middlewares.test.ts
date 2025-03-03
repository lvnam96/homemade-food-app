import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import {
  getRequestData,
  requireAnonymousUser,
  requireAuthenticatedUser,
  requireFormBody,
  requireJsonBody,
  requirePathParams,
  requireSearchParams,
  requireValidTokenPayload,
  requireValidTokenType,
} from './middlewares';
import { getAuthSessionById } from '../modules/auth';

vi.mock('../modules/auth/index.ts', () => {
  return {
    getAuthSessionById: vi.fn(),
  };
});

afterEach(() => {
  vi.resetAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
});

const validAccessToken =
  'eyJhbGciOiJIUzI1NiJ9.eyJwYXlsb2FkIjp7InNlc3Npb25JZCI6IjI5IiwidXNlciI6eyJpZCI6IjIxIiwiZW1haWwiOiJuaDBrdmpwcDB5Ymg2QGdtYWlsLmNvbSJ9fSwidHlwZSI6ImFjY2Vzc190b2tlbiIsImlhdCI6MTc0MDkwOTg3MywiZXhwIjoxNzQwOTk2MjczfQ.UBp-u9aeafMjML0sENOP0uGGDdgwGytOg-zPG2LUUEA';
// const validRefreshToken =
//   'eyJhbGciOiJIUzI1NiJ9.eyJwYXlsb2FkIjp7InNlc3Npb25JZCI6IjI5IiwidXNlciI6eyJpZCI6IjIxIiwiZW1haWwiOiJuaDBrdmpwcDB5Ymg2QGdtYWlsLmNvbSJ9fSwidHlwZSI6InJlZnJlc2hfdG9rZW4iLCJpYXQiOjE3NDA5MDk4NzMsImV4cCI6MTc0MzUwMTg3M30.aR24q5WTJawLu58iEaLSSRxDJ2DuI4sgaHvIjf1OBdU';

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
      id: BigInt('29'),
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
    await expect(
      requireAuthenticatedUser({
        request: new Request('https://example.com', {
          headers: new Headers({
            Authorization: 'Bearer invalid.jwt',
          }),
        }),
      }),
    ).rejects.toThrow(Response);
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

    await expect(
      requireAnonymousUser({
        request: new Request('https://example.com', {
          headers: new Headers({
            Authorization: 'Bearer invalid.jwt',
          }),
        }),
      }),
    ).rejects.toThrow(Response);

    const existingSession: Awaited<ReturnType<typeof getAuthSessionById>> = {
      id: BigInt('29'),
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

describe('requireValidTokenPayload()', () => {
  const existingSession: Awaited<ReturnType<typeof getAuthSessionById>> = {
    id: BigInt('1'),
    userId: BigInt('1'),
    createdAt: new Date(),
    expiredAt: new Date(),
    updatedAt: null,
  };

  it('should do nothing if token is valid', async () => {
    if (vi.isMockFunction(getAuthSessionById)) getAuthSessionById.mockImplementation(() => existingSession);

    await expect(
      requireValidTokenPayload({
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
