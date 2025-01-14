// implement tests for url controller at `./controller.ts`

import { describe, expect, it } from 'vitest';
import {
  getHomePagePathWithParams,
  getLoginPagePathWithParams,
  getLogoutPagePathWithParams,
  getRegisterAuthCodePagePathWithParams,
  getRegisterPagePathWithParams,
} from './controller';

describe('getLoginPagePathWithParams()', () => {
  it('should return login page path', () => {
    expect(getLoginPagePathWithParams()).toBe('/login');
  });
});

describe('getRegisterPagePathWithParams()', () => {
  it('should return register page path', () => {
    expect(getRegisterPagePathWithParams()).toBe('/register');
  });
});

describe('getRegisterAuthCodePagePathWithParams()', () => {
  it('should return register auth code page path', () => {
    expect(getRegisterAuthCodePagePathWithParams()).toBe('/register/auth-code');
  });
});

describe('getHomePagePathWithParams()', () => {
  it('should return home page path', () => {
    expect(getHomePagePathWithParams()).toBe('/');
  });
});

describe('getLogoutPagePathWithParams()', () => {
  it('should return logout page path', () => {
    expect(getLogoutPagePathWithParams()).toBe('/logout');
  });
});
