import { describe, expect, it } from 'vitest';
import { signJwt, verifyJwt } from './jwt';
import { generateKeyPair, randomBytes, type KeyObject } from 'node:crypto';
describe('JWT utils', () => {
  it('should work for RS family of algorithms', async () => {
    const { privateKey } = await new Promise<{ publicKey: KeyObject; privateKey: KeyObject }>((resolve, reject) => {
      generateKeyPair(
        'rsa',
        {
          modulusLength: 2048,
        },
        (err, publicKey, privateKey) => {
          if (err) reject(err);
          resolve({ publicKey, privateKey });
        },
      );
    });

    const token = await signJwt<{ bar: string }>(
      { bar: 'foo' },
      {
        secret: privateKey,
        algorithm: 'RS512',
      },
    );
    const parsed = await verifyJwt<{ bar: string }>(token, {
      secret: privateKey,
      algorithms: ['RS512'],
    });
    expect(parsed.payload.bar).toBe('foo');
  });

  it('should work for HS family of algorithms', async () => {
    const secret = randomBytes(64).toString('hex');
    const token = await signJwt<{ bar: string }>(
      { bar: 'baz' },
      {
        secret: new TextEncoder().encode(secret),
        algorithm: 'HS512',
      },
    );
    const parsed = await verifyJwt<{ bar: string }>(token, {
      secret: new TextEncoder().encode(secret),
      algorithms: ['HS512'],
    });
    expect(parsed.payload.bar).toBe('baz');
  });
});
