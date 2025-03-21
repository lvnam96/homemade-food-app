import { type ActionFunctionArgs } from '@remix-run/node';
import {
  apiErrorCodes,
  getBadRequestResponse,
  getBearerTokenFromAuthHeader,
  wrapResponseBody,
} from '~/.server/utils/api';
import { createPooledDBConnection } from '~/.server/db';
import { makeObjectPropsJsonCompatible } from '~/utils/data';
import {
  composeMiddlewares,
  defaultApiRouteErrorHandler,
  requireAnonymousUser,
  requireJsonBody,
  requireValidTokenType,
} from '../middlewares';
import { generateAccessToken, generateRefreshToken, signUserIn, signUserOut, signUserUp } from '~/.server/modules/auth';

// export const loader = async ({ request }: LoaderFunctionArgs) => {};

export const action = async (actionArgs: ActionFunctionArgs) => {
  const { request } = actionArgs;
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const target = url.searchParams.get('target');

  if (request.method === 'POST' && action === 'signup' && target === 'account') {
    return await composeMiddlewares({
      middlewares: [
        requireJsonBody(),
        requireAnonymousUser,
        async ({ cache }) => {
          const json = cache.get('json')!;
          const { db, pool } = createPooledDBConnection();
          const newUserData = await signUserUp(json as any, {
            pooledDBInstance: db,
          });
          await pool.end();
          return Response.json(wrapResponseBody(makeObjectPropsJsonCompatible(newUserData)));
        },
      ],
    })(actionArgs);
  } else if (request.method === 'POST' && action === 'signin') {
    return await composeMiddlewares({
      middlewares: [
        requireJsonBody(),
        requireAnonymousUser,
        async ({ cache }) => {
          const json = cache.get('json')!;
          const { jwtPayload } = await signUserIn(json as any);
          return Response.json(
            wrapResponseBody(
              makeObjectPropsJsonCompatible({
                accessToken: await generateAccessToken(jwtPayload),
                refreshToken: await generateRefreshToken(jwtPayload),
              }),
            ),
          );
        },
      ],
    })(actionArgs);
  } else if (request.method === 'POST' && action === 'signout') {
    try {
      await requireValidTokenType({
        expectedTokenType: 'refresh_token',
      })(actionArgs);

      const refreshToken = getBearerTokenFromAuthHeader(request.headers.get('Authorization'));
      if (!refreshToken)
        throw getBadRequestResponse({
          code: apiErrorCodes.INVALID_AUTH_TOKEN,
          message: 'Refresh token is required',
        });

      await signUserOut(refreshToken); // If this fails, we still need to delete the session/tokens from the client and it doesn't do any harm staying in the db anyway.
    } catch (err) {
      defaultApiRouteErrorHandler(err, request);
    }

    return new Response(null, { status: 204 });
  }
};
