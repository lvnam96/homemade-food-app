import { joinPathWithParams } from '~/utils/url';

export const getLoginPagePathWithParams = (params?: Parameters<typeof joinPathWithParams>[1]) =>
  joinPathWithParams('/login', params);

export const getLogoutPagePathWithParams = (params?: Parameters<typeof joinPathWithParams>[1]) =>
  joinPathWithParams('/logout', params);

export const getHomePagePathWithParams = (params?: Parameters<typeof joinPathWithParams>[1]) =>
  joinPathWithParams('/', params);

export const getRegisterPagePathWithParams = (params?: Parameters<typeof joinPathWithParams>[1]) =>
  joinPathWithParams('/register', params);

export const getRegisterAuthCodePagePathWithParams = (params?: Parameters<typeof joinPathWithParams>[1]) =>
  joinPathWithParams('/register/auth-code', params);
