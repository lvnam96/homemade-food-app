import { jwtDecode, type JwtPayload } from 'jwt-decode';
import type { Nullishable } from './types';

type DecodeTokenReturnType<D, T> = T extends string ? JwtPayload & D : null;

/**
 * Decodes a JWT and returns its payload
 * @param token - The JWT to decode
 * @param shouldDecodeHeader - Whether to decode the header as well
 * @returns The decoded token payload or null if decoding fails
 */
export const decodeToken = <
  D extends Record<string, any> = Record<string, any>,
  T extends Nullishable<string> = Nullishable<string>,
>(
  token: T,
  shouldDecodeHeader = false,
): DecodeTokenReturnType<D, T> => {
  if (typeof token === 'string' && token.length > 0) {
    try {
      return jwtDecode<D>(token, {
        header: shouldDecodeHeader,
      }) as DecodeTokenReturnType<D, T>;
    } catch (err) {
      if (!import.meta.env.PROD) {
        console.error(err);
      }
    }
  }
  return null as DecodeTokenReturnType<D, T>;
};
