// import { Authenticator } from 'remix-auth';
// import { type ProviderUser } from './providers/provider';
import invariant from 'tiny-invariant';
import { signJwt, verifyJwt } from '~/.server/utils/jwt';
import { createUser, verifyUserPassword } from './models/user';
import { createAuthSession, deleteAuthSessionById, getAuthSessionById } from './models/session';
import { makeObjectPropsJsonCompatible } from '~/utils/data';
import type { UserCredentials, UserCredentialsForInsert, UserDataForInsert } from './types';

import '~/.server/utils/import-env';

export * from './models/user';
export * from './models/session';

const ONE_MONTH_IN_MILISECONDS = 60 * 60 * 24 * 30;
export const getSessionExpirationDate = () => new Date(Date.now() + ONE_MONTH_IN_MILISECONDS * 1000);

export const generateAccessToken = (
  payload: AccessTokenPayload['payload'],
  expirationTime?: string | number | Date,
) => {
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

export const generateRefreshToken = (
  payload: RefreshTokenPayload['payload'],
  expirationTime?: string | number | Date,
) => {
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
    throw new Error('Token is expired or not yet valid');
  }

  // Validate the token's authorized party (azp) claim:
  invariant(import.meta.env.PUBLIC_ORIGIN, 'Missing env variable `PUBLIC_ORIGIN`');
  const permittedOrigins = [import.meta.env.PUBLIC_ORIGIN];
  if (typeof tokenPayload.azp === 'string' && !permittedOrigins.includes(tokenPayload.azp)) {
    throw new Error('Invalid `azp` claim');
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

export const signUserIn = async ({ email, password }: { email: UserCredentials['email']; password: string }) => {
  invariant(email, 'Invalid credentials');
  invariant(password, 'Invalid credentials');

  const user = await verifyUserPassword(email, password);
  if (!user) throw new Error('Invalid credentials');

  const session = await createAuthSession({
    userId: user.id.toString(),
    expiredAt: getSessionExpirationDate(),
  });
  const jwtPayload = makeObjectPropsJsonCompatible({
    sessionId: session.id,
    user: {
      id: user.id,
      email: email,
    },
  });
  return {
    user: user,
    session,
    jwtPayload,
  };
};

export const signUserOut = async (refreshToken: string) => {
  // const authSession = await authSessionStorage.getSession(request.headers.get('cookie'));
  // const sessionId = authSession.get(sessionIdKey);
  const tokenPayload = await verifyJwt<RefreshTokenPayload>(refreshToken);
  const sessionId = tokenPayload.payload.payload.sessionId;
  const userId = tokenPayload.payload.payload.user.id;

  if (sessionId) {
    void (await deleteAuthSessionById(sessionId));
  } else console.error('No auth session ID found. User ID:', userId);
};

export const signUserUp = async (
  user: Pick<UserCredentialsForInsert, 'email' | 'password'> &
    Omit<UserDataForInsert, 'createdAt' | 'updatedAt' | 'deletedAt'>,
  { pooledDBInstance }: Parameters<typeof createUser>[1],
) => {
  invariant(user, 'User data is required');
  invariant(user.email, 'Email is required');
  invariant(user.password, 'Password is required');

  user.displayedName = user.displayedName || user.email;

  return createUser(user, { pooledDBInstance });
};
