import { describe, expect, it } from 'vitest';
import { getStrongCryptoRandomStr } from './random.server';

describe('getStrongCryptoRandomStr()', () => {
  it('should generate random string', async () => {
    const str = await getStrongCryptoRandomStr(16);
    expect(typeof str).toBe('string');
  });

  it('should generate random string with expected length', async () => {
    const str1 = await getStrongCryptoRandomStr(16);
    expect(str1.length).toBe(32);

    const str2 = await getStrongCryptoRandomStr(32);
    expect(str2.length).toBe(64);
  });
});
