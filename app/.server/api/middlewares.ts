import type { ActionFunctionArgs } from '@remix-run/node';
import { verifyJwt } from '~/.server/utils/jwt';
import {
  getBadRequestResponse,
  getBearerTokenFromAuthHeader,
  getForbiddenResponse,
  getGeneralServerErrorResponse,
  getUnauthorizedResponse,
} from '~/.server/utils/api';
import { getAuthSessionById } from '~/.server/modules/auth';
import { apiErrorCodes } from '~/services/api';
import type { JWTVerifyResult } from 'jose';
import type { MaybePromise, Nullishable } from '~/utils/types';
import { parseFormData, type FileUploadHandler } from '@mjackson/form-data-parser';

const getRequestBearerToken = (authHeader: string | null) => {
  try {
    const token = getBearerTokenFromAuthHeader(authHeader || '');
    return token;
  } catch (err) {
    throw getGeneralServerErrorResponse();
  }
};

const getRequestBearerTokenData = async <
  P extends AccessTokenPayload | RefreshTokenPayload,
  T extends string | null = string | null,
>(
  token: T,
): Promise<T extends null ? null : JWTVerifyResult<P>> => {
  try {
    if (token) return verifyJwt<P>(token) as Promise<T extends null ? null : JWTVerifyResult<P>>;
    return null as unknown as Promise<T extends null ? null : JWTVerifyResult<P>>;
  } catch (err) {
    throw getGeneralServerErrorResponse();
  }
};

export const getRequestData = async <P extends AccessTokenPayload | RefreshTokenPayload>({
  request,
}: Pick<ActionFunctionArgs, 'request'>): Promise<{
  token: string | null;
  tokenPayload: JWTVerifyResult<P>['payload'] | null;
}> => {
  try {
    const token = getRequestBearerToken(request.headers.get('Authorization'));
    const jwtVerifyResult = await getRequestBearerTokenData<P>(token);
    return {
      token,
      tokenPayload: jwtVerifyResult?.payload ?? null,
    };
  } catch (err) {
    throw getGeneralServerErrorResponse();
  }
};

export const requireAuthenticatedUser = async ({ request }: Pick<ActionFunctionArgs, 'request'>) => {
  const requestData = await getRequestData<AccessTokenPayload>({ request });
  await requireValidTokenPayload({ tokenPayload: requestData.tokenPayload ?? null });
  requireValidTokenType({
    tokenType: requestData.tokenPayload?.type,
    expectedTokenType: 'access_token',
  });
  return requestData;
};

export const requireAnonymousUser = async ({ request }: Pick<ActionFunctionArgs, 'request'>) => {
  try {
    const { tokenPayload } = await getRequestData({ request });

    const sessionId = tokenPayload?.payload?.sessionId;
    if (sessionId && (await getAuthSessionById(sessionId))?.userId?.toString() === tokenPayload.payload?.user.id)
      throw getForbiddenResponse({ code: apiErrorCodes.ANONYMOUS_REQUIRED });
  } catch (err) {
    throw getGeneralServerErrorResponse();
  }
};

export const requireValidTokenPayload = async <
  T extends {
    payload: {
      sessionId: TokenPayload['sessionId'];
      user: {
        id: TokenPayload['user']['id'];
      };
    };
  },
>({
  tokenPayload,
}: {
  tokenPayload: T | null;
}): Promise<void> => {
  try {
    const sessionId = tokenPayload?.payload?.sessionId;
    if (!sessionId || (await getAuthSessionById(sessionId))?.userId?.toString() !== tokenPayload.payload?.user.id)
      throw getUnauthorizedResponse({ code: apiErrorCodes.INVALID_AUTH_TOKEN });
  } catch (err) {
    throw getGeneralServerErrorResponse();
  }
};

export const requireValidTokenType = ({
  expectedTokenType,
  tokenType,
}: {
  expectedTokenType: AccessTokenPayload['type'] | RefreshTokenPayload['type'];
  tokenType: Nullishable<AccessTokenPayload['type'] | RefreshTokenPayload['type']>;
}) => {
  const validTokenTypes = ['access_token', 'refresh_token'];
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

export const requireFormBody = async ({
  request,
  predicate,
  parseHandler,
}: Pick<ActionFunctionArgs, 'request'> & {
  predicate?: <T>(requestBody: T) => MaybePromise<null | string>; // returns message if validation fails, null otherwise
  parseHandler?: FileUploadHandler;
}) => {
  if (
    request.headers.get('content-type')?.toLowerCase() !== 'application/x-www-form-urlencoded' &&
    !request.headers.get('content-type')?.startsWith('multipart/form-data')
  ) {
    throw getBadRequestResponse({
      code: apiErrorCodes.INVALID_REQUEST_BODY,
      message: 'Invalid `Content-Type` header',
    });
  }

  if (!predicate) return;

  let requestBody: FormData;
  if (request.headers.get('content-type')?.toLowerCase() === 'application/x-www-form-urlencoded')
    requestBody = await request.clone().formData();
  else {
    requestBody = await parseFormData(request, parseHandler);
  }
  const validationMessage = await predicate(requestBody);
  if (validationMessage) {
    throw getBadRequestResponse({
      code: apiErrorCodes.INVALID_REQUEST_BODY,
      message: validationMessage,
    });
  }
};

export const requireJsonBody = async ({
  request,
  predicate = () => null,
}: Pick<ActionFunctionArgs, 'request'> & {
  predicate?: (requestBody: unknown) => MaybePromise<null | string>; // returns message if validation fails, null otherwise
}) => {
  if (request.headers.get('content-type')?.toLowerCase() !== 'application/json') {
    throw getBadRequestResponse({
      code: apiErrorCodes.INVALID_REQUEST_BODY,
      message: 'Invalid `Content-Type` header',
    });
  }

  const requestBody = await request.clone().json();
  const validationMessage = await predicate(requestBody);
  if (validationMessage) {
    throw getBadRequestResponse({
      code: apiErrorCodes.INVALID_REQUEST_BODY,
      message: validationMessage,
    });
  }
};

export const requireSearchParams = async ({
  request,
  predicate = () => null,
}: Pick<ActionFunctionArgs, 'request'> & {
  predicate?: <T extends URLSearchParams>(requestBody: T) => MaybePromise<null | string>; // returns message if validation fails, null otherwise
}) => {
  const url = new URL(request.url);
  if (!url.searchParams.size) {
    throw getBadRequestResponse({
      code: apiErrorCodes.INVALID_REQUEST_QUERY_PARAMS,
      message: 'Missing required query parameters',
    });
  }

  const validationMessage = await predicate(url.searchParams);
  if (validationMessage) {
    throw getBadRequestResponse({
      code: apiErrorCodes.INVALID_REQUEST_QUERY_PARAMS,
      message: validationMessage,
    });
  }
};
export const requirePathParams = async ({
  params,
  predicate,
}: Pick<ActionFunctionArgs, 'params'> & {
  predicate: <T extends typeof params>(requestBody: T) => MaybePromise<null | string>; // returns message if validation fails, null otherwise
}) => {
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
