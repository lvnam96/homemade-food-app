import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { decodeToken } from './token';
import { consoleError } from 'tests/setup/setup-test-env';

const sampleJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'; // grabbed from https://jwt.io

describe('decodeToken()', () => {
  beforeEach(() => {
    consoleError.mockImplementation(() => {});
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should decode data in JWT', () => {
    expect(decodeToken(sampleJwt)).toMatchObject({
      sub: '1234567890',
      name: 'John Doe',
      iat: 1516239022,
    });
  });

  it('should return `null` if JWT is not valid', () => {
    expect(decodeToken('invalid.jwt')).toBeNull();
  });
});
