import { type ActionFunctionArgs } from '@remix-run/node';
import {
  getBadRequestResponse,
  getBearerTokenFromAuthHeader,
  getGeneralServerErrorResponse,
  getUnauthorizedResponse,
  wrapResponseBody,
} from '~/.server/utils/api';
import { makeObjectPropsJsonCompatible } from '~/utils/data';
import { getRequestData, requireAnonymousUser, requireJsonBody, requireValidTokenType } from '../middlewares';
import { generateAccessToken, generateRefreshToken, signUserIn, signUserOut, signUserUp } from '~/.server/modules/auth';
import { apiErrorCodes } from '~/services/api';

// export const loader = async ({ request }: LoaderFunctionArgs) => {};

export const action = async (actionArgs: ActionFunctionArgs) => {
  const { request } = actionArgs;
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const target = url.searchParams.get('target');

  if (request.method === 'POST' && action === 'signup' && target === 'account') {
    try {
      await requireJsonBody(actionArgs);
      await requireAnonymousUser(actionArgs);

      const json = await request.json();
      const newUserData = await signUserUp(json);
      return Response.json(wrapResponseBody(makeObjectPropsJsonCompatible(newUserData)));
    } catch (err) {
      if (err instanceof Response) throw err;
      console.error(err);
      return getGeneralServerErrorResponse();
    }
  } else if (request.method === 'POST' && action === 'signin') {
    try {
      await requireJsonBody(actionArgs);
      await requireAnonymousUser(actionArgs);

      const json = await request.json();
      const { jwtPayload } = await signUserIn(json);
      return Response.json(
        wrapResponseBody(
          makeObjectPropsJsonCompatible({
            accessToken: await generateAccessToken(jwtPayload),
            refreshToken: await generateRefreshToken(jwtPayload),
          }),
        ),
      );
    } catch (err) {
      if (err instanceof Response) throw err;
      console.error(err);
      return getUnauthorizedResponse();
    }
  } else if (request.method === 'POST' && action === 'signout') {
    try {
      const { tokenPayload } = await getRequestData<RefreshTokenPayload>(actionArgs);
      requireValidTokenType({
        expectedTokenType: 'refresh_token',
        tokenType: tokenPayload?.type,
      });

      const refreshToken = getBearerTokenFromAuthHeader(request.headers.get('Authorization')); // Bearer token
      if (!refreshToken)
        throw getBadRequestResponse({
          code: apiErrorCodes.INVALID_AUTH_TOKEN,
          message: 'Refresh token is required',
        });

      await signUserOut(refreshToken); // If this fails, we still need to delete the session/tokens from the client and it doesn't do any harm staying in the db anyway.
    } catch (err) {
      if (err instanceof Response) throw err;
      console.error(err);
      return getGeneralServerErrorResponse();
    }

    return new Response(null, { status: 204 });
  }
};
