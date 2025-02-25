import { describe, expect, it } from 'vitest';
import { createApiInstance, generateAuthHeaderValue, parseLinkHeader } from './api';

describe('createApiInstance()', () => {
  it('should provide a way to get the default instance', () => {
    expect(createApiInstance().get).toBeTypeOf('function');
  });
});

describe('parseLinkHeader()', () => {
  it('should parse "link" header from response object', () => {
    const fakeResponse = {
      headers: {
        link: '</api/users?page=1&per_page=10>; rel="current",</api/users?page=2&per_page=10>; rel="next",</api/users?page=2&per_page=10>; rel="last',
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
