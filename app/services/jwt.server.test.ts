import { describe, expect, it } from 'vitest';
import { signJwt, verifyJwt } from './jwt.server';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

describe('JWT utils', () => {
  it('should work for RS family of algorithms', async () => {
    const certPub = await readFile(resolve(__dirname, '../../tests/dump/rsa-public-key.pem'), {
      encoding: 'utf8',
    });
    const certPriv = await readFile(resolve(__dirname, '../../tests/dump/rsa-private-key.pem'), {
      encoding: 'utf8',
    });

    const token = await signJwt({ bar: 'foo' }, certPriv, { algorithm: 'RS512' });
    const parsed = await verifyJwt(token, certPub, { algorithms: ['RS512'] });
    expect(parsed.bar).toBe('foo');
  });

  it('should work for HS family of algorithms', async () => {
    const token = await signJwt({ bar: 'foo' }, 's3Cr3T', { algorithm: 'HS512' });
    const parsed = await verifyJwt(token, 's3Cr3T', { algorithms: ['HS512'] });
    expect(parsed.bar).toBe('foo');
  });
});
