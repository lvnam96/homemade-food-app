/* eslint-disable no-new */
import { describe, expect, it } from 'vitest';
import { createApiInstance, parseLinkHeader } from './api';

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
