import { decodeToken } from '~/utils/token';
import { SignJWT, type JWTPayload, type ProduceJWT } from 'jose';
import { apiErrorCodes, type ApiResponseError, type ApiResponseSuccess } from '~/services/api';
import invariant from 'tiny-invariant';

export const wrapResponseBody = <T extends JSONValue = JSONValue>(
  data: T,
  meta: ApiResponseSuccess['meta'] = null,
  links: ApiResponseSuccess['links'] = null,
): ApiResponseSuccess<T> => ({
  data: data,
  errors: null,
  meta,
  links,
});

export const wrapResponseError = (
  errors: ApiResponseError['errors'],
  meta: ApiResponseError['meta'] = null,
): ApiResponseError => ({
  data: null,
  errors,
  meta,
  links: null,
});

export const getBearerToken = ({ request }: { request: Request }) =>
  request.headers.get('Authorization')?.substring('Bearer '.length);

export const authRequest = ({ request }: { request: Request }) => {
  const accessToken = getBearerToken({ request });
  invariant(accessToken, 'Access token is required');
  const tokenPayload = decodeToken<AccessTokenPayload>(accessToken);
  if (!tokenPayload || typeof tokenPayload.user?.id !== 'number') throw new Error('Invalid access token');

  return tokenPayload;
};

export const unauthorizedError = {
  code: apiErrorCodes.UNAUTHORIZED,
  message: 'Unauthorized',
};
export const getUnauthorizedResponse = ({
  code = unauthorizedError.code,
  message = unauthorizedError.message,
}: {
  code?: string;
  message?: string;
} = unauthorizedError) =>
  Response.json(
    wrapResponseError([
      {
        code,
        message,
      },
    ]),
    { status: 401 },
  );

export const forbiddenError = {
  code: apiErrorCodes.FORBIDDEN,
  message: 'Request is forbidden',
};
export const getForbiddenResponse = ({
  code = forbiddenError.code,
  message = forbiddenError.message,
}: {
  code?: string;
  message?: string;
} = forbiddenError) =>
  Response.json(
    wrapResponseError([
      {
        code,
        message,
      },
    ]),
    { status: 403 },
  );

export const notFoundError = {
  code: apiErrorCodes.NOT_FOUND,
  message: 'Requested data is not found',
};
export const getNotFoundResponse = ({
  code = notFoundError.code,
  message = notFoundError.message,
}: {
  code?: string;
  message?: string;
} = notFoundError) =>
  Response.json(
    wrapResponseError([
      {
        code,
        message,
      },
    ]),
    { status: 404 },
  );

export const badRequestError = {
  code: apiErrorCodes.BAD_REQUEST,
  message: 'Invalid request due to missing search parameters or invalid body value/format',
};
export const getBadRequestResponse = ({
  code = badRequestError.code,
  message = badRequestError.message,
}: {
  code?: string;
  message?: string;
} = badRequestError) =>
  Response.json(
    wrapResponseError([
      {
        code,
        message,
      },
    ]),
    { status: 400 },
  );

const generateToken = async (
  payload?: JWTPayload,
  expirationTime: Parameters<ProduceJWT['setExpirationTime']>[0] = '1w',
) =>
  await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(new TextEncoder().encode(import.meta.env.PUBLIC_JWT_SECRET));

export const generateAccessToken = async (
  payload: AccessTokenPayload,
  expirationTime?: Parameters<typeof generateToken>[1],
) => await generateToken({ payload, type: 'access_token' }, expirationTime || '1d');

export const generateRefreshToken = async (
  payload: RefreshTokenPayload,
  expirationTime?: Parameters<typeof generateToken>[1],
) => await generateToken({ payload, type: 'refresh_token' }, expirationTime || '30d');
