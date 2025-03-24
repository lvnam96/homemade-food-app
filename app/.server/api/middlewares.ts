import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { verifyJwt } from '~/.server/utils/jwt';
import {
  apiErrorCodes,
  getBadRequestResponse,
  getBearerTokenFromAuthHeader,
  getForbiddenResponse,
  getGeneralServerErrorResponse,
  getUnauthorizedResponse,
} from '~/.server/utils/api';
import { checkIsValidSessionInTokenPayload, getAuthSessionById, verifyTokenClaims } from '~/.server/modules/auth';
import type { JWTVerifyResult } from 'jose';
import type { MaybePromise } from '~/utils/types';
import { getRequestCache } from '~/.server/utils/request-cache';
import { parseFormData, type FileUploadHandler } from '@mjackson/form-data-parser';
import { AuthError, getPublicErrorResponseData, handleError, ServerBaseError } from '~/.server/utils/error';
import type { Session } from '~/.server/modules/auth/types';

const getRequestCacheForMiddleware = (...args: Parameters<typeof getRequestCache>) =>
  getRequestCache<{
    tokenPayload: JWTVerifyResult<AccessTokenPayload | RefreshTokenPayload>['payload'] | null;
    json: JSONValue;
    searchParams: URLSearchParams;
    formData: FormData;
    session: Session;
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

export const defaultApiRouteErrorHandler = (err: unknown, request: Request) => {
  // Middleware can throw a Response to abort early:
  if (err instanceof Response) throw err; // TODO: decide to return or rethrow Response object

  if (err instanceof ServerBaseError) {
    handleError(err, { request });
    throw getGeneralServerErrorResponse(getPublicErrorResponseData(err));
  } else throw getGeneralServerErrorResponse(); // for other errors that not wrapped as custom error
};
/**
 * NOTE: Only applicable to middlewares that have same signature as `(args: ActionFunctionArgs | LoaderFunctionArgs) => Promise<any>`
 *
 * Usage with action/loader:
 * ```ts
 *  export const action = composeMiddleware({
 *    middlewares: [
 *      requireAuthenticatedUser,
 *      requireFormBody(),
 *      async ({ request, cache }) => {
 *        // Access `formData` in `cache` which was set by `requireFormBody`
 *        // Access `tokenPayload` in `cache` which was set by `requireAuthenticatedUser`
 *        // Rest of your action logic
 *      }
 *    ]
 * });
 * ```
 */
export const composeMiddlewares =
  ({
    middlewares,
    handleError = defaultApiRouteErrorHandler,
  }: {
    middlewares: Array<
      (
        args: (ActionFunctionArgs | LoaderFunctionArgs) & { cache: ReturnType<typeof getRequestCacheForMiddleware> },
      ) => Promise<any>
    >;
    handleError?: (err: unknown, req: Request) => Response;
  }) =>
  async (args: ActionFunctionArgs | LoaderFunctionArgs) => {
    try {
      const cache = getRequestCacheForMiddleware(args.request);
      const enhancedArgs = { ...args, cache };

      for (const middleware of middlewares) {
        const result = await middleware(enhancedArgs);
        // Middleware can return a Response to respond early:
        if (result instanceof Response) return result;
      }
    } catch (err) {
      return handleError(err, args.request);
    }
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
    throw new AuthError({
      code: apiErrorCodes.INVALID_AUTH_TOKEN,
      publicMessage: 'Missing token',
    });
  if (!tokenPayload)
    throw new AuthError({
      code: apiErrorCodes.INVALID_AUTH_TOKEN,
      publicMessage: 'Missing token payload',
    });

  await verifyTokenClaims({ tokenPayload });
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
  const tokenPayload = cache.get('tokenPayload');
  if (!tokenPayload?.payload?.sessionId) throw getUnauthorizedResponse({ code: apiErrorCodes.INVALID_AUTH_TOKEN });

  const session = await getAuthSessionById(tokenPayload.payload.sessionId);
  if (!session || session?.userId?.toString() !== tokenPayload?.payload?.user.id)
    throw getUnauthorizedResponse({ code: apiErrorCodes.INVALID_AUTH_TOKEN });

  cache.set('session', session);
  return session;
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
