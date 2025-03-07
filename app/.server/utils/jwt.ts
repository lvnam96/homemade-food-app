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

import '~/.server/utils/import-env';

export const signJwt = <T extends Record<string, any> = JWTPayload>(
  payload: T,
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
): Promise<string> =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: algorithm })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(secret || Buffer.from(process.env.JWT_SECRET));

export const verifyJwt = <T extends Record<string, any> = JWTPayload>(
  token: Parameters<typeof jwtVerify>[0],
  {
    secret,
    ...options
  }: JWTVerifyOptions & {
    secret?: KeyLike | Uint8Array;
  } = {},
): Promise<JWTVerifyResult<T>> =>
  jwtVerify<T>(token, secret || Buffer.from(process.env.JWT_SECRET), {
    algorithms: ['HS512', 'RS512'],
    ...options,
  });
