import {
  jwtVerify,
  SignJWT,
  type JWTHeaderParameters,
  type JWTPayload,
  type JWTVerifyOptions,
  type JWTVerifyResult,
  type KeyLike,
  type ProduceJWT,
} from 'jose';
import { checkIsPlainObject } from '~/utils/data';
import { invariant } from './invariant';
import { AuthError } from './error';
import { apiErrorCodes } from './api';

import '~/.server/utils/import-env';

export const signJwt = (
  payload: Record<string, JSONValue> & JWTPayload,
  {
    secret,
    expirationTime = '1w',
    algorithm = 'HS512',
  }: {
    secret?: Parameters<SignJWT['sign']>[0];
    expirationTime?: Parameters<ProduceJWT['setExpirationTime']>[0];
    algorithm?: JWTHeaderParameters['alg'];
  } = {
    expirationTime: '1w',
    algorithm: 'HS512',
  },
) => {
  if (!secret) invariant(process.env.JWT_SECRET, 'Missing env variable `JWT_SECRET`');
  if (!checkIsPlainObject(payload))
    throw new AuthError({
      privateMessage: 'Payload must be an object',
      publicMessage: 'Invalid token payload',
      code: apiErrorCodes.INVALID_AUTH_TOKEN,
    });
  try {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: algorithm })
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .sign(secret || Buffer.from(process.env.JWT_SECRET));
  } catch (error) {
    throw new AuthError({
      ...(error as Error),
      privateMessage: (error as Error).message,
      code: apiErrorCodes.INVALID_AUTH_TOKEN,
      publicMessage: 'Invalid token payload',
    });
  }
};

export const verifyJwt = async <T extends Record<string, any> = JWTPayload>(
  token: Parameters<typeof jwtVerify>[0],
  {
    secret,
    ...options
  }: JWTVerifyOptions & {
    secret?: KeyLike | Uint8Array;
  } = {},
): Promise<JWTVerifyResult<T>> => {
  if (!secret) invariant(process.env.JWT_SECRET, 'Missing env variable `JWT_SECRET`');
  try {
    return await jwtVerify<T>(token, secret || Buffer.from(process.env.JWT_SECRET), {
      algorithms: ['HS512', 'RS512'],
      ...options,
    });
  } catch (error) {
    throw new AuthError({
      ...(error as Error),
      privateMessage: (error as Error).message,
      code: apiErrorCodes.INVALID_AUTH_TOKEN,
      publicMessage: 'Invalid token',
    });
  }
};
