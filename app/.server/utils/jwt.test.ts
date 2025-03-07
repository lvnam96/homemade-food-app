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

    const token = await signJwt(
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
    const token = await signJwt(
      { bar: 'baz' },
      {
        secret: Buffer.from(secret),
        algorithm: 'HS512',
      },
    );
    const parsed = await verifyJwt<{ bar: string }>(token, {
      secret: Buffer.from(secret),
      algorithms: ['HS512'],
    });
    expect(parsed.payload.bar).toBe('baz');
  });
});

describe('verifyJwt()', () => {
  it('should throw if token is invalid', async () => {
    await expect(verifyJwt('invalid')).rejects.toThrow();
  });
});

describe('signJwt()', () => {
  it('should return valid JWT as string', async () => {
    const token = await signJwt({ bar: 'foo' });
    expect(typeof token === 'string').toBe(true);

    const parsed = await verifyJwt<{ bar: string }>(token);
    expect(parsed.payload.bar).toBe('foo');
  });

  it('should throw when payload is invalid', async () => {
    // @ts-expect-error Testing invalid argument
    expect(() => signJwt('undefined')).toThrow();
    // @ts-expect-error Testing invalid argument
    expect(() => signJwt(undefined)).toThrow();
    // @ts-expect-error Testing invalid argument
    expect(() => signJwt(null)).toThrow();
  });
});
