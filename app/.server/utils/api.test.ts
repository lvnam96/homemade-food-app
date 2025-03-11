import { describe, expect, it } from 'vitest';
import {
  badRequestError,
  generalServerError,
  getBadRequestResponse,
  getBearerTokenFromAuthHeader,
  getForbiddenResponse,
  getGeneralServerErrorResponse,
  getNotFoundResponse,
  getUnauthorizedResponse,
  notFoundError,
  unauthorizedError,
  wrapResponseBody,
  wrapResponseError,
} from './api';

describe('wrapResponseBody()', () => {
  const data = { id: 1 };
  const meta = { total: 1 };
  const links = {
    self: 'https://self-url.com',
    first: 'https://first-url.com',
    last: 'https://last-url.com',
    prev: 'https://prev-url.com',
    next: 'https://next-url.com',
  };

  it('should work correctly', () => {
    expect(wrapResponseBody(data)).toEqual({
      data,
      errors: null,
      meta: null,
      links: null,
    });
  });

  it('should work correctly with `meta` data as second argument', () => {
    expect(wrapResponseBody(data, meta)).toEqual({
      data,
      errors: null,
      meta,
      links: null,
    });
  });

  it('should work correctly with `links` data as third argument', () => {
    expect(wrapResponseBody(data, undefined, links)).toEqual({
      data,
      errors: null,
      meta: null,
      links,
    });
  });
});

describe('wrapResponseError()', () => {
  const errors = [{ code: 'code', message: 'message' }];
  const meta = { total: 1 };

  it('should work correctly', () => {
    expect(wrapResponseError(errors)).toEqual({
      data: null,
      errors,
      meta: null,
      links: null,
    });
  });

  it('should work correctly with `meta` data as second argument', () => {
    expect(wrapResponseError(errors, meta)).toEqual({
      data: null,
      errors,
      meta,
      links: null,
    });
  });
});

describe('getBearerTokenFromAuthHeader()', () => {
  it('should work correctly', () => {
    const request = { headers: { get: () => 'Bearer jwt.token' } } as unknown as Request;
    expect(getBearerTokenFromAuthHeader(request.headers.get('Authorization'))).toEqual('jwt.token');
  });

  it('should handle nullish values', () => {
    const request = { headers: { get: () => null } } as unknown as Request;
    expect(getBearerTokenFromAuthHeader(request.headers.get('Authorization'))).toBeNull();
  });
});

describe('getUnauthorizedResponse()', () => {
  it('should return response with 401 status code', async () => {
    const res = getUnauthorizedResponse();
    expect(res.status).toEqual(401);
  });

  it('should generate response with expected format', async () => {
    const res = getUnauthorizedResponse();
    const resBody = await res.json();
    expect(resBody).toMatchObject({
      data: null,
      meta: null,
      links: null,
      errors: [
        {
          code: unauthorizedError.code,
        },
      ],
    });
  });
});

describe('getForbiddenResponse()', () => {
  it('should return response with 403 status code', () => {
    const res = getForbiddenResponse();
    expect(res.status).toEqual(403);
  });
});
describe('getNotFoundResponse()', () => {
  it('should return response with 404 status code', async () => {
    const res = getNotFoundResponse();
    expect(res.status).toEqual(404);
  });

  it('should generate response with expected format', async () => {
    const res = getNotFoundResponse();
    const resBody = await res.json();
    expect(resBody).toMatchObject({
      data: null,
      meta: null,
      links: null,
      errors: [
        {
          code: notFoundError.code,
        },
      ],
    });
  });
});

describe('getBadRequestResponse()', () => {
  it('should return response with 400 status code', async () => {
    const res = getBadRequestResponse();
    expect(res.status).toEqual(400);
  });

  it('should generate response with expected format', async () => {
    const res = getBadRequestResponse();
    const resBody = await res.json();
    expect(resBody).toMatchObject({
      data: null,
      meta: null,
      links: null,
      errors: [
        {
          code: badRequestError.code,
        },
      ],
    });
  });
});

describe('getGeneralServerErrorResponse()', () => {
  it('should return response with 500 status code', async () => {
    const res = getGeneralServerErrorResponse();
    expect(res.status).toEqual(500);
  });

  it('should generate response with expected format', async () => {
    const res = getGeneralServerErrorResponse();
    const resBody = await res.json();
    expect(resBody).toMatchObject({
      data: null,
      meta: null,
      links: null,
      errors: [
        {
          code: generalServerError.code,
        },
      ],
    });
  });
});
