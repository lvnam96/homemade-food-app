import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { authSessionsInHf, userCredentialsInHf, usersInHf } from '~/.server/db/schema';

export type UserCredentials = InferSelectModel<typeof userCredentialsInHf>;

export type UserCredentialsForInsert = InferInsertModel<typeof userCredentialsInHf>;

export type UserData = InferSelectModel<typeof usersInHf>;

export type UserDataForInsert = InferInsertModel<typeof usersInHf>;

export type Session = InferSelectModel<typeof authSessionsInHf>;
