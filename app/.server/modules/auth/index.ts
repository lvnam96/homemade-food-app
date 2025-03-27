// import { Authenticator } from 'remix-auth';
// import { type ProviderUser } from './providers/provider';
import { invariant } from '~/.server/utils/invariant';
import { signJwt, verifyJwt } from '~/.server/utils/jwt';
import { createUser, verifyUserPassword } from './models/user';
import { createAuthSession, deleteAuthSessionById, getAuthSessionById } from './models/session';
import { makeObjectPropsJsonCompatible } from '~/utils/data';
import type { Session, UserCredentials, UserCredentialsForInsert, UserData, UserDataForInsert } from './types';

import '~/.server/utils/import-env';
import { AuthError, LogicError } from '~/.server/utils/error';
import { apiErrorCodes } from '~/services/api';

export * from './models/user';
export * from './models/session';

const ONE_MONTH_IN_SECONDS = 60 * 60 * 24 * 30;
export const getSessionExpirationDate = () => new Date(Date.now() + ONE_MONTH_IN_SECONDS * 1000);

const generateAccessToken = (payload: AccessTokenPayload['payload'], expirationTime?: string | number | Date) => {
  invariant(import.meta.env.PUBLIC_ORIGIN, 'Missing env variable `PUBLIC_ORIGIN`');
  return signJwt(
    {
      payload,
      type: 'access_token',
      azp: import.meta.env.PUBLIC_ORIGIN,
    },
    { expirationTime: expirationTime || '30m' },
  );
};

const generateRefreshToken = (payload: RefreshTokenPayload['payload'], expirationTime?: string | number | Date) => {
  invariant(import.meta.env.PUBLIC_ORIGIN, 'Missing env variable `PUBLIC_ORIGIN`');
  return signJwt(
    {
      payload,
      type: 'refresh_token',
      azp: import.meta.env.PUBLIC_ORIGIN,
    },
    { expirationTime: expirationTime || '30d' },
  );
};

// export const authenticator = new Authenticator<ProviderUser>();

export const verifyTokenClaims = async ({ tokenPayload }: { tokenPayload: SharedJWTPayload }) => {
  const currentTime = Math.floor(Date.now() / 1000);

  // Validate the token's expiration (exp) and not before (nbf) claims:
  if ((tokenPayload.exp && tokenPayload.exp < currentTime) || (tokenPayload.nbf && tokenPayload.nbf > currentTime)) {
    throw new AuthError({
      privateMessage: 'Token is expired or not yet valid',
      code: apiErrorCodes.INVALID_AUTH_TOKEN,
      publicMessage: 'Invalid token claims',
    });
  }

  // Validate the token's authorized party (azp) claim:
  invariant(import.meta.env.PUBLIC_ORIGIN, 'Missing env variable `PUBLIC_ORIGIN`');
  const permittedOrigins = [import.meta.env.PUBLIC_ORIGIN];
  if (typeof tokenPayload.azp === 'string' && !permittedOrigins.includes(tokenPayload.azp)) {
    throw new AuthError({
      privateMessage: 'Invalid `azp` claim',
      code: apiErrorCodes.INVALID_AUTH_TOKEN,
      publicMessage: 'Invalid token claims',
    });
  }
};

export const checkIsValidSessionInTokenPayload = async <
  T extends {
    payload: {
      sessionId: SharedJWTPayload['payload']['sessionId'];
      user: {
        id: SharedJWTPayload['payload']['user']['id'];
      };
    };
  },
>({
  tokenPayload,
}: {
  tokenPayload: T | null;
}): Promise<boolean> => {
  const sessionId = tokenPayload?.payload?.sessionId;
  return !!sessionId && (await getAuthSessionById(sessionId))?.userId?.toString() === tokenPayload.payload?.user.id;
};

export const createPayloadForNewTokens = ({
  userId,
  email,
  sessionId,
}: {
  userId: UserData['id'];
  email: UserCredentials['email'];
  sessionId: Session['id'];
}) => ({
  sessionId,
  user: {
    id: userId,
    email: email,
  },
});

/**
 *
 * @param expirationTime Must provide same expiration time (in SECONDS) as new session in DB otherwise this will create tokens where expiration time of tokens does not match expiration time of session in DB
 */
export const createNewPairOfTokens = async (
  payload: ReturnType<typeof createPayloadForNewTokens>,
  expirationTime: number,
) => {
  const jsonizablePayload = makeObjectPropsJsonCompatible(payload);
  validateSessionExpirationTime(expirationTime);
  return {
    accessToken: await generateAccessToken(jsonizablePayload),
    refreshToken: await generateRefreshToken(jsonizablePayload, expirationTime),
  };
};

const validateSessionExpirationTime = (expirationTime: number) => {
  // expirationTime must is in seconds, positive, not in the past
  if (typeof expirationTime !== 'number' || expirationTime <= 0 || Date.now() / 1000 > expirationTime) {
    throw new LogicError({
      code: apiErrorCodes.UNKNOWN_ERROR,
      publicMessage: 'Something went wrong',
      privateMessage: 'Invalid expiration time when creating tokens',
    });
  }
};

export const signUserIn = async ({ email, password }: { email: UserCredentials['email']; password: string }) => {
  invariant(email, 'Missing email', {
    code: apiErrorCodes.INVALID_CREDENTIALS,
    publicMessage: 'Invalid credentials',
  });
  invariant(password, 'Missing password', {
    code: apiErrorCodes.INVALID_CREDENTIALS,
    publicMessage: 'Invalid credentials',
  });

  const user = await verifyUserPassword(email, password);
  if (!user)
    throw new LogicError({
      code: apiErrorCodes.INVALID_CREDENTIALS,
      publicMessage: 'Invalid credentials',
    });

  const sessionExpirationDate = getSessionExpirationDate();
  const session = await createAuthSession({
    userId: user.id.toString(),
    expiredAt: sessionExpirationDate,
  });
  const { accessToken, refreshToken } = await createNewPairOfTokens(
    createPayloadForNewTokens({
      sessionId: session.id,
      userId: user.id,
      email,
    }),
    sessionExpirationDate.getTime() / 1000,
  );
  return {
    user: user,
    session,
    accessToken,
    refreshToken,
  };
};

export const signUserOut = async (refreshToken: string) => {
  // const authSession = await authSessionStorage.getSession(request.headers.get('cookie'));
  // const sessionId = authSession.get(sessionIdKey);
  const tokenPayload = await verifyJwt<RefreshTokenPayload>(refreshToken);
  const sessionId = tokenPayload.payload.payload.sessionId;
  const userId = tokenPayload.payload.payload.user.id;

  if (!sessionId) {
    throw new AuthError({
      code: apiErrorCodes.INVALID_AUTH_TOKEN,
      publicMessage: 'Invalid token',
      privateMessage: `Missing sessionId in refresh token for user ${userId}`,
    });
  }

  await deleteAuthSessionById(sessionId);
  return { success: true };
};

export const signUserUp = async (
  user: Pick<UserCredentialsForInsert, 'email' | 'password'> &
    Omit<UserDataForInsert, 'createdAt' | 'updatedAt' | 'deletedAt'>,
  { pooledDBInstance }: Parameters<typeof createUser>[1],
) => {
  invariant(user, 'User data is required', {
    code: apiErrorCodes.BAD_REQUEST,
    publicMessage: 'Missing user data',
  });
  invariant(user.email, 'Email is required', {
    code: apiErrorCodes.INVALID_CREDENTIALS,
    publicMessage: 'Email is required',
  });
  invariant(user.password, 'Password is required', {
    code: apiErrorCodes.INVALID_CREDENTIALS,
    publicMessage: 'Password is required',
  });

  user.displayedName = user.displayedName || user.email;

  return createUser(user, { pooledDBInstance });
};
