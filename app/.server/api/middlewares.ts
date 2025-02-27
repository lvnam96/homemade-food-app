import type { ActionFunctionArgs } from '@remix-run/node';
import { verifyJwt } from '~/.server/utils/jwt';
import {
  getBearerTokenFromAuthHeader,
  getForbiddenResponse,
  getGeneralServerErrorResponse,
  getUnauthorizedResponse,
} from '~/.server/utils/api';
import { getAuthSessionById } from '~/.server/modules/auth';
import { apiErrorCodes } from '~/services/api';
import type { JWTVerifyResult } from 'jose';
import type { Nullishable } from '~/utils/types';

export const getRequestBearerToken = (authHeader: string | null) => {
  try {
    const token = getBearerTokenFromAuthHeader(authHeader || '');
    return token;
  } catch (err) {
    throw getGeneralServerErrorResponse();
  }
};

export const getRequestBearerTokenData = async <
  P extends { payload: TokenPayload },
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

export const getRequestData = async <P extends { payload: TokenPayload }>({
  request,
}: Pick<ActionFunctionArgs, 'request'>): Promise<{
  token: string | null;
  tokenPayload: JWTVerifyResult<P> | null;
}> => {
  try {
    const token = getRequestBearerToken(request.headers.get('Authorization') || '');
    const tokenPayload = await getRequestBearerTokenData<P>(token);
    return {
      token,
      tokenPayload,
    };
  } catch (err) {
    throw getGeneralServerErrorResponse();
  }
};

export const requireAuthenticatedUser = async ({ request }: Pick<ActionFunctionArgs, 'request'>) => {
  const requestData = await getRequestData<AccessTokenPayload>({ request });
  await requireValidToken({ tokenPayload: requestData.tokenPayload?.payload ?? null });
  await requireValidTokenType({
    tokenType: requestData.tokenPayload?.payload?.type,
    expectedTokenType: 'access_token',
  });
  return requestData;
};

export const requireAnonymousUser = async ({ request }: Pick<ActionFunctionArgs, 'context' | 'request'>) => {
  try {
    const { tokenPayload } = await getRequestData<AccessTokenPayload>({ request });

    const sessionId = tokenPayload?.payload?.payload?.sessionId;
    if (
      sessionId &&
      (await getAuthSessionById(sessionId))?.userId?.toString() === tokenPayload.payload.payload?.user.id
    )
      throw getForbiddenResponse({ code: apiErrorCodes.ANONYMOUS_REQUIRED });
  } catch (err) {
    throw getGeneralServerErrorResponse();
  }
};

export const requireValidToken = async <T extends AccessTokenPayload | RefreshTokenPayload>({
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

export const requireValidTokenType = async ({
  expectedTokenType,
  tokenType,
}: {
  expectedTokenType: AccessTokenPayload['type'] | RefreshTokenPayload['type'];
  tokenType: Nullishable<AccessTokenPayload['type'] | RefreshTokenPayload['type']>;
}): Promise<void> => {
  if (expectedTokenType !== tokenType) throw getUnauthorizedResponse({ code: apiErrorCodes.INVALID_AUTH_TOKEN_TYPE });
};
