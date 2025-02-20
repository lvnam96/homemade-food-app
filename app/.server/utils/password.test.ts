import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { comparePassword, getSaltedPassword, hashPassword } from './password';

const plainPasswd =
  'bf73164d9941ba1afcf8027913aef0631fc001a2170b76746027a552ece3c0e3a665ccc61f2f0bfbc60669bbdf9ce7f560493bc0f1c494e6eddcf03f3c0b53ac'; // an random SHA512 hash

describe('hashPassword()', async () => {
  let hash1: string | undefined, hash2: string | undefined;
  beforeEach(async () => {
    hash2 = await hashPassword(plainPasswd);
    hash1 = await hashPassword(plainPasswd);
  });
  afterEach(() => {
    hash1 = undefined;
    hash2 = undefined;
  });

  it('should be able to hash passwords', async () => {
    expect(hash1).toBeTypeOf('string');
    expect(hash2).toBeTypeOf('string');
    expect(hash1?.length).toBe(60);
    expect(hash2?.length).toBe(60);
  });

  it('should hash different passwords for the same input', async () => {
    expect(hash1).not.toBe(hash2);
  });
});

describe('comparePassword()', async () => {
  it('should be able to compare original string with hashed string', async () => {
    const hash1 = await hashPassword(plainPasswd);
    expect(await comparePassword(plainPasswd, hash1)).toBe(true);
  });
});

describe('getSaltedPassword()', () => {
  it('should add salt to the end of passwword', async () => {
    const salt = 'abcd';
    const { passwd } = await getSaltedPassword(plainPasswd, salt);
    expect(passwd.indexOf(plainPasswd)).toBe(0);
    expect(passwd.includes(salt)).toBe(true);
    expect(passwd.length - salt.length).toBe(plainPasswd.length);
  });

  it('should create salt if not provided', async () => {
    const { passwd, salt } = await getSaltedPassword(plainPasswd);
    expect(passwd.indexOf(plainPasswd)).toBe(0);
    expect(passwd.length - salt.length).toBe(plainPasswd.length);
  });

  it('should throw error if "password" argument is invalid', async () => {
    // @ts-expect-error intentally passing invalid arg type
    await expect(() => getSaltedPassword()).rejects.toThrow();
    // @ts-expect-error intentally passing invalid arg type
    await expect(() => getSaltedPassword(123)).rejects.toThrow();
  });
});
