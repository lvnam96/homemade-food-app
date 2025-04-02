import {
  composeMiddlewares,
  requireAuthenticatedUser,
  requireHttpMethod,
  requireValidTokenType,
} from '~/.server/api/middlewares';
import { createPooledDBConnection } from '~/.server/db';
import {
  createAuthSession,
  createNewPairOfTokens,
  createPayloadForNewTokens,
  deleteAuthSessionById,
  getSessionExpirationDate,
} from '~/.server/modules/auth';
import { wrapResponseBody } from '~/.server/utils/api';
import { makeObjectPropsJsonCompatible } from '~/utils/data';

export const action = composeMiddlewares({
  middlewares: [
    requireHttpMethod({ requiredMethods: ['POST'] }),
    requireAuthenticatedUser,
    requireValidTokenType({ expectedTokenType: 'refresh_token' }),
    async ({ cache }) => {
      const { db, pool } = createPooledDBConnection();
      const { accessToken, refreshToken } = await db.transaction(async (tx) => {
        const session = cache.get('session')!;
        await deleteAuthSessionById(session.id.toString(), { dbInstance: tx });

        const tokenPayload = cache.get('tokenPayload')!;
        const sessionExpirationDate = getSessionExpirationDate();
        const newSession = await createAuthSession(
          {
            userId: tokenPayload.payload.user.id,
            expiredAt: sessionExpirationDate,
          },
          { dbInstance: tx },
        );

        const { accessToken, refreshToken } = await createNewPairOfTokens(
          createPayloadForNewTokens({
            sessionId: newSession.id,
            userId: newSession.userId,
            email: tokenPayload.payload.user.email,
          }),
          sessionExpirationDate.getTime() / 1000,
        );

        return {
          accessToken,
          refreshToken,
          session: newSession,
        };
      });

      await pool.end();

      return Response.json(
        wrapResponseBody(
          makeObjectPropsJsonCompatible({
            accessToken,
            refreshToken,
          }),
        ),
      );
    },
  ],
});
