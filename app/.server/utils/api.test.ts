import { describe, expect, it } from 'vitest';
import { getBearerToken, wrapResponseBody, wrapResponseError } from './api';

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

describe('getBearerToken()', () => {
  it('should work correctly', () => {
    const request = { headers: { get: () => 'Bearer jwt.token' } } as unknown as Request;
    expect(getBearerToken({ request })).toEqual('jwt.token');
  });
});
