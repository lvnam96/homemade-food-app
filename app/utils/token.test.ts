import { describe, expect, it } from 'vitest';
import { decodeToken } from './token';
import { consoleError } from 'tests/setup/setup-test-env';

const sampleJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'; // grabbed from https://jwt.io

describe('decodeToken()', () => {
  it('should decode data in JWT', () => {
    expect(decodeToken(sampleJwt)).toMatchObject({
      sub: '1234567890',
      name: 'John Doe',
      iat: 1516239022,
    });
  });

  it('should return `null` if JWT is empty or not exist', () => {
    expect(decodeToken('')).toBeNull();
    expect(decodeToken(undefined)).toBeNull();
    expect(decodeToken(null)).toBeNull();
  });

  it('should NOT throw even if JWT is not valid (just log error to console)', () => {
    // Expect error to be logged to stderr when verifying token fails:
    consoleError.mockImplementation(() => {});

    expect(() => decodeToken('invalid.jwt')).not.toThrow();
    expect(decodeToken('invalid.jwt')).toBeNull();
  });
});
