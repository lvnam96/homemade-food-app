import { describe, expect, it } from 'vitest';
import { compare, getSaltedPasswd, hash } from './password.server';

describe('Password service:', () => {
  const plainPasswd =
    'bf73164d9941ba1afcf8027913aef0631fc001a2170b76746027a552ece3c0e3a665ccc61f2f0bfbc60669bbdf9ce7f560493bc0f1c494e6eddcf03f3c0b53ac'; // an random SHA512 hash

  describe('bcrypt:', () => {
    it('should be able to hash & compare passwords using bcrypt', async () => {
      // bcrypt generate different output with the same input:
      const hash1 = await hash(plainPasswd);
      const hash2 = await hash(plainPasswd);
      expect(hash1 !== hash2).toBe(true);
      expect(await compare(plainPasswd, hash1)).toBe(true);
      expect(await compare(plainPasswd, hash2)).toBe(true);
    });
  });

  describe('Password helpers:', () => {
    it('should add salt to the end of passwword', async () => {
      const salt = 'abcd';
      const { passwd } = await getSaltedPasswd(plainPasswd, salt);
      expect(passwd.indexOf(plainPasswd)).toBe(0);
      expect(passwd.includes(salt)).toBe(true);
      expect(passwd.length - salt.length).toBe(plainPasswd.length);
    });

    it('should create salt if not provided', async () => {
      const { passwd, salt } = await getSaltedPasswd(plainPasswd);
      expect(passwd.indexOf(plainPasswd)).toBe(0);
      expect(passwd.length - salt.length).toBe(plainPasswd.length);
    });

    it('should throw error if "password" argument is invalid', async () => {
      // @ts-expect-error intentally passing invalid arg type
      await expect(() => getSaltedPasswd()).rejects.toThrow();
      // @ts-expect-error intentally passing invalid arg type
      await expect(() => getSaltedPasswd(123)).rejects.toThrow();
    });
  });
});
