import type { ActionFunctionArgs } from '@remix-run/node';
import { verifyJwt } from '~/.server/utils/jwt';
import {
  getBadRequestResponse,
  getBearerTokenFromAuthHeader,
  getForbiddenResponse,
  getUnauthorizedResponse,
} from '~/.server/utils/api';
import { checkIsValidSessionInTokenPayload, verifyTokenClaims } from '~/.server/modules/auth';
import { apiErrorCodes } from '~/services/api';
import type { JWTVerifyResult } from 'jose';
import type { MaybePromise } from '~/utils/types';
import { getRequestCache } from '~/.server/utils/request-cache';
import { parseFormData, type FileUploadHandler } from '@mjackson/form-data-parser';

const getRequestCacheForMiddleware = (...args: Parameters<typeof getRequestCache>) =>
  getRequestCache<{
    tokenPayload: JWTVerifyResult<AccessTokenPayload | RefreshTokenPayload>['payload'] | null;
    json: JSONValue;
    searchParams: URLSearchParams;
    formData: FormData;
  }>(...args);

const getRequestBearerTokenData = async <
  P extends AccessTokenPayload | RefreshTokenPayload,
  T extends string | null = string | null,
>(
  token: T,
): Promise<T extends null ? null : JWTVerifyResult<P>> => {
  if (token) return verifyJwt<P>(token) as Promise<T extends null ? null : JWTVerifyResult<P>>;
  return null as unknown as Promise<T extends null ? null : JWTVerifyResult<P>>;
};

export const getRequestData = async <P extends AccessTokenPayload | RefreshTokenPayload>({
  request,
}: Pick<ActionFunctionArgs, 'request'>): Promise<{
  token: string | null;
  tokenPayload: JWTVerifyResult<P>['payload'] | null;
}> => {
  const cache = getRequestCacheForMiddleware(request);
  // Retrieving token is not expensive so we don't cache it:
  const token = getBearerTokenFromAuthHeader(request.headers.get('Authorization'));

  if (!cache.has('tokenPayload')) {
    const jwtVerifyResult = await getRequestBearerTokenData<P>(token);
    cache.set('tokenPayload', jwtVerifyResult?.payload ?? null);
  }

  return {
    token,
    tokenPayload: cache.get('tokenPayload')!,
  };
};

export const requireAuthenticatedUser = async ({ request }: Pick<ActionFunctionArgs, 'request'>) => {
  const { token, tokenPayload } = await getRequestData<AccessTokenPayload>({ request });

  if (!token)
    throw getUnauthorizedResponse({
      code: apiErrorCodes.INVALID_AUTH_TOKEN,
      message: 'Missing token',
    });
  if (!tokenPayload)
    throw getUnauthorizedResponse({
      code: apiErrorCodes.INVALID_AUTH_TOKEN,
      message: 'Invalid token payload',
    });

  try {
    await verifyTokenClaims({ tokenPayload });
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      throw getUnauthorizedResponse({
        code: apiErrorCodes.INVALID_AUTH_TOKEN,
        message: 'Invalid token claims',
      });
    }
  }
  await requireValidSessionInToken({ request });

  return { token, tokenPayload };
};

export const requireAnonymousUser = async ({ request }: Pick<ActionFunctionArgs, 'request'>) => {
  const { tokenPayload } = await getRequestData({ request });

  if (await checkIsValidSessionInTokenPayload({ tokenPayload }))
    throw getForbiddenResponse({ code: apiErrorCodes.ANONYMOUS_REQUIRED });
};

export const requireValidSessionInToken = async ({ request }: Pick<ActionFunctionArgs, 'request'>) => {
  const cache = getRequestCacheForMiddleware(request);
  if (!cache.has('tokenPayload')) {
    const { tokenPayload } = await getRequestData<AccessTokenPayload | RefreshTokenPayload>({ request });
    cache.set('tokenPayload', tokenPayload);
  }
  const tokenPayload = cache.get('tokenPayload')!;

  if (!(await checkIsValidSessionInTokenPayload({ tokenPayload })))
    throw getUnauthorizedResponse({ code: apiErrorCodes.INVALID_AUTH_TOKEN });
};

export const requireValidTokenType =
  ({ expectedTokenType }: { expectedTokenType: AccessTokenPayload['type'] | RefreshTokenPayload['type'] }) =>
  async ({ request }: Pick<ActionFunctionArgs, 'request'>) => {
    const validTokenTypes = ['access_token', 'refresh_token'];
    const cache = getRequestCacheForMiddleware(request);
    if (!cache.has('tokenPayload')) {
      const { tokenPayload } = await getRequestData<AccessTokenPayload | RefreshTokenPayload>({ request });
      cache.set('tokenPayload', tokenPayload);
    }
    const tokenType = cache.get('tokenPayload')?.type;

    if (
      !tokenType ||
      !validTokenTypes.includes(tokenType) ||
      !validTokenTypes.includes(expectedTokenType) ||
      expectedTokenType !== tokenType
    )
      throw getUnauthorizedResponse({
        code: apiErrorCodes.INVALID_AUTH_TOKEN_TYPE,
        message: 'Invalid token type',
      });
  };

export const requireFormBody =
  (
    {
      predicate = () => null,
      parseHandler,
    }: {
      predicate?: <T>(requestBody: T) => MaybePromise<null | string>; // returns message if validation fails, null otherwise
      parseHandler?: FileUploadHandler;
    } = {
      predicate: () => null,
    },
  ) =>
  async ({ request }: Pick<ActionFunctionArgs, 'request'>) => {
    const contentTypeHeader = request.headers.get('content-type');
    if (
      contentTypeHeader?.toLowerCase() !== 'application/x-www-form-urlencoded' &&
      !contentTypeHeader?.startsWith('multipart/form-data')
    ) {
      throw getBadRequestResponse({
        code: apiErrorCodes.INVALID_REQUEST_BODY,
        message: 'Invalid `Content-Type` header',
      });
    }

    const cache = getRequestCacheForMiddleware(request);
    if (!cache.has('formData')) {
      let formData: FormData;
      if (contentTypeHeader?.toLowerCase() === 'application/x-www-form-urlencoded') {
        formData = await request.clone().formData();
      } else {
        formData = await parseFormData(request, parseHandler);
      }

      cache.set('formData', formData);
    }
    const requestBody = cache.get('formData')!;

    const validationMessage = await predicate(requestBody);
    if (validationMessage) {
      throw getBadRequestResponse({
        code: apiErrorCodes.INVALID_REQUEST_BODY,
        message: validationMessage,
      });
    }
  };

export const requireJsonBody =
  (
    {
      predicate = () => null,
    }: {
      predicate?: (requestBody: unknown) => MaybePromise<null | string>; // returns message if validation fails, null otherwise
    } = {
      predicate: () => null,
    },
  ) =>
  async ({ request }: Pick<ActionFunctionArgs, 'request'>) => {
    if (request.headers.get('content-type')?.toLowerCase() !== 'application/json') {
      throw getBadRequestResponse({
        code: apiErrorCodes.INVALID_REQUEST_BODY,
        message: 'Invalid `Content-Type` header',
      });
    }

    const cache = getRequestCacheForMiddleware(request);
    if (!cache.has('json')) {
      const json = await request.clone().json();
      cache.set('json', json);
    }
    const requestBody = cache.get('json')!;

    const validationMessage = await predicate(requestBody);
    if (validationMessage) {
      throw getBadRequestResponse({
        code: apiErrorCodes.INVALID_REQUEST_BODY,
        message: validationMessage,
      });
    }
  };

export const requireSearchParams =
  (
    {
      predicate = () => null,
    }: {
      predicate?: <T extends URLSearchParams>(requestBody: T) => MaybePromise<null | string>; // returns message if validation fails, null otherwise
    } = {
      predicate: () => null,
    },
  ) =>
  async ({ request }: Pick<ActionFunctionArgs, 'request'>) => {
    const cache = getRequestCacheForMiddleware(request);
    if (!cache.has('searchParams')) {
      const url = new URL(request.url);
      cache.set('searchParams', url.searchParams);
    }
    const searchParams = cache.get('searchParams')!;

    if (!searchParams.size) {
      throw getBadRequestResponse({
        code: apiErrorCodes.INVALID_REQUEST_QUERY_PARAMS,
        message: 'Missing required query parameters',
      });
    }

    const validationMessage = await predicate(searchParams);
    if (validationMessage) {
      throw getBadRequestResponse({
        code: apiErrorCodes.INVALID_REQUEST_QUERY_PARAMS,
        message: validationMessage,
      });
    }
  };

export const requirePathParams =
  ({
    predicate,
  }: {
    predicate: <T extends ActionFunctionArgs['params']>(requestBody: T) => MaybePromise<null | string>; // returns message if validation fails, null otherwise
  }) =>
  async ({ params }: Pick<ActionFunctionArgs, 'params'>) => {
    if (!Object.keys(params).length) {
      throw getBadRequestResponse({
        message: 'Missing required path parameters',
      });
    }

    const validationMessage = await predicate(params);
    if (validationMessage) {
      throw getBadRequestResponse({
        message: validationMessage,
      });
    }
  };
