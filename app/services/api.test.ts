import { describe, expect, it } from 'vitest';
import { assertResponseBody, createApiInstance, generateAuthHeaderValue, parseLinkHeader } from './api';

describe('createApiInstance()', () => {
  it('should provide a way to get the default instance', () => {
    const instance = createApiInstance();
    expect(instance.head).toBeTypeOf('function');
    expect(instance.get).toBeTypeOf('function');
    expect(instance.post).toBeTypeOf('function');
    expect(instance.put).toBeTypeOf('function');
    expect(instance.patch).toBeTypeOf('function');
    expect(instance.delete).toBeTypeOf('function');
  });
});

describe('parseLinkHeader()', () => {
  it('should parse "link" header from response object', () => {
    const fakeResponse = {
      headers: {
        link: '</api/users?page=1&per_page=10>; rel="current",</api/users?page=2&per_page=10>; rel="next",</api/users?page=2&per_page=10>; rel="last"',
      },
    };
    const parsedLinkHeader = parseLinkHeader(fakeResponse);

    expect(parsedLinkHeader.lastPageIndex).toBe(2);
    expect(parsedLinkHeader.nextPageIndex).toBe(2);
    expect(parsedLinkHeader.prevPageIndex).toBe(null);
  });
});

describe('generateAuthHeaderValue()', () => {
  it('should generate bearer token as auth header value', () => {
    expect(generateAuthHeaderValue('123456')).toBe('Bearer 123456');
  });
});

describe('assertResponseBody()', () => {
  it('should assert success response body', () => {
    expect(() =>
      assertResponseBody({
        errors: [],
        data: {}, // any
        meta: null,
        links: null,
      }),
    ).not.toThrowError();
  });

  it('should assert error response body', () => {
    expect(() =>
      assertResponseBody({
        errors: [{ message: 'error message', code: 'error code' }],
        data: null,
        meta: null,
        links: null,
      }),
    ).toThrowError();

    expect(() =>
      assertResponseBody({
        errors: [{ message: 'error message', code: 'error code' }],
        data: { a: null }, // any
        meta: null,
        links: null,
      }),
    ).toThrowError();
  });

  it('should assert error response body with `skipAssertData` option disabled', () => {
    expect(() =>
      assertResponseBody(
        {
          errors: null,
          data: null,
          meta: null,
          links: null,
        },
        {
          skipAssertData: false,
        },
      ),
    ).toThrowError();
  });

  it('`skipAssertData` option is disabled by default', () => {
    expect(() =>
      assertResponseBody({
        errors: null,
        data: null,
        meta: null,
        links: null,
      }),
    ).toThrowError();
  });

  it('should assert error response body with `skipAssertData` option enabled', () => {
    expect(() =>
      assertResponseBody(
        {
          errors: null,
          data: null,
          meta: null,
          links: null,
        },
        {
          skipAssertData: true,
        },
      ),
    ).not.toThrowError();
  });
});
