// NOTE: `dbInstance` prop applies "dependencies injection" pattern for testing

import { eq, getTableName, sql } from 'drizzle-orm';
import { userCredentialsInHf, usersInHf } from '~/.server/db/schema';
import type { UserCredentials, UserCredentialsForInsert, UserDataForInsert } from '../types';
import { pick } from '~/utils/data';
import { db, type createPooledDBConnection } from '~/.server/db';
// import { bigint, date, object, orNull, string } from '@adllang/jsonbinding';
import { comparePassword, getSaltedPassword, hashPassword } from '~/.server/utils/password';

// export const userJsonBinding = object<UserData>({
//   id: bigint(),
//   displayedName: string(),
//   merchantId: orNull(bigint()),
//   phoneNumber: orNull(string()),
//   createdAt: date(),
//   updatedAt: orNull(date()),
//   deletedAt: orNull(date()),
// });

export const normalizeEmail = (s: string) => s.toLowerCase();

export const normalizeUsername = (s: string) => s.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();

export const getUserById = async (
  id: string,
  {
    dbInstance = db,
  }: {
    dbInstance?: typeof db | Parameters<Parameters<(typeof db)['transaction']>[0]>[0];
  } = {
    dbInstance: db,
  },
) =>
  // `SELECT * FROM ${usersInHf} WHERE ${usersInHf.id} = ${id}`
  (
    await dbInstance
      .select()
      .from(usersInHf)
      .where(eq(usersInHf.id, BigInt(id)))
  )[0];

// export const getUserByEmail = async (email: UserCredentials['email']) =>
//   // `SELECT * FROM ${usersInHf} INNER JOIN ${userCredentialsInHf} ON ${usersInHf.id} = ${userCredentialsInHf.userId} WHERE ${userCredentialsInHf.email} = ${email}`
//   db
//     .select()
//     .from(usersInHf)
//     .innerJoin(userCredentialsInHf, eq(usersInHf.id, userCredentialsInHf.userId))
//     .where(eq(userCredentialsInHf.email, email));

// export const getUserCredentialsByEmail = async (email: UserCredentials['email']) =>
//   // `SELECT * FROM ${userCredentialsInHf} WHERE ${userCredentialsInHf.email} = ${email}`
//   db.select().from(userCredentialsInHf).where(eq(userCredentialsInHf.email, email));

export const deleteUserByEmail = async (
  email: UserCredentials['email'],
  {
    dbInstance = db,
  }: {
    dbInstance?: typeof db | Parameters<Parameters<(typeof db)['transaction']>[0]>[0];
  } = {
    dbInstance: db,
  },
) => {
  // `DELETE FROM ${usersInHf} USING ${userCredentialsInHf} WHERE ${userCredentialsInHf.email} = ${email} AND ${usersInHf.id} = ${userCredentialsInHf.userId} RETURNING *`;
  const userId = dbInstance
    .$with('user_id')
    .as(
      dbInstance
        .select({ value: userCredentialsInHf.userId })
        .from(userCredentialsInHf)
        .where(eq(userCredentialsInHf.email, email)),
    );
  return await dbInstance
    .with(userId)
    .delete(usersInHf)
    .where(eq(usersInHf.id, sql`(select * from ${userId})`))
    .returning();
};

export const createUser = async (
  user: Pick<UserCredentialsForInsert, 'email' | 'password'> &
    Omit<UserDataForInsert, 'createdAt' | 'updatedAt' | 'deletedAt'>,
  {
    pooledDBInstance,
  }: {
    pooledDBInstance: ReturnType<typeof createPooledDBConnection>['db'];
  },
) => {
  return await pooledDBInstance.transaction(async (tx) => {
    const normalizedEmail = normalizeEmail(user.email);

    // Since we already leverage `SELECT ... ON CONFLICT DO NOTHING` when inserting into `userCredentialsInHf` table, we don't need to check if the email already exists before inserting user data as if email already exists, we throw error effectively making entire transaction rollback:
    // Lock the row if it exists (`FOR UPDATE` ensures exclusive lock)
    // const existingUser = await tx
    //   .select()
    //   .from(userCredentialsInHf)
    //   .where(eq(userCredentialsInHf.email, normalizedEmail))
    //   .for('update');
    // if (existingUser.length) {
    //   throw new Error(`Email ${user.email} is already registered by another user`);
    // }

    const { passwd, salt } = await getSaltedPassword(user.password);
    const hashedPassword = await hashPassword(passwd);

    // `INSERT INTO ${usersInHf} (${usersInHf.displayName}, ${usersInHf.phoneNumber}) VALUES (${user.email}, ${null}) RETURNING *`
    const [userRes] = await tx
      .insert(usersInHf)
      .values(pick(user, ['displayedName', 'phoneNumber']))
      .returning();

    // `INSERT INTO ${userCredentialsInHf} (${userCredentialsInHf.password}, ${userCredentialsInHf.salt}, ${userCredentialsInHf.email}, ${userCredentialsInHf.userId}) VALUES (${hashedPassword}, ${user.email}, ${userRes[0].id}) RETURNING *`
    const [userCredentialsRes] = await tx
      .insert(userCredentialsInHf)
      .values({
        email: normalizedEmail,
        salt,
        password: hashedPassword,
        userId: userRes.id,
      })
      .onConflictDoNothing({ target: userCredentialsInHf.email })
      .returning();

    if (!userCredentialsRes) {
      // FIXME: check if we must clean up the user record we just created
      // await tx.delete(usersInHf).where(eq(usersInHf.id, userRes.id));
      throw new Error(`Email ${user.email} is already registered by another user`);
    }

    return { ...userRes, email: userCredentialsRes.email };
  });
};

export const verifyUserPassword = async (
  email: UserCredentials['email'],
  password: UserCredentials['password'],
  {
    dbInstance = db,
  }: {
    dbInstance?: typeof db | Parameters<Parameters<(typeof db)['transaction']>[0]>[0];
  } = {
    dbInstance: db,
  },
) => {
  const isValidInput =
    typeof email === 'string' && email.length > 0 && typeof password === 'string' && password.length > 0;
  if (!isValidInput) {
    return null;
  }

  let user = null;
  let userCredential = null;
  try {
    // `SELECT * FROM ${userCredentialsInHf} INNER JOIN ${usersInHf} on ${userCredentialsInHf.userId} = ${usersInHf.id} WHERE ${userCredentialsInHf.email} = ${email}`
    const rows = await dbInstance
      .select()
      .from(userCredentialsInHf)
      .where(eq(userCredentialsInHf.email, normalizeEmail(email)))
      .innerJoin(usersInHf, eq(userCredentialsInHf.userId, usersInHf.id));

    if (rows.length && rows[0]) {
      user = rows[0][getTableName(usersInHf)];
      userCredential = rows[0][getTableName(userCredentialsInHf)];
    }
  } catch (error) {
    console.error('Error querying user:', error);
  }

  // Timing attack protection: Always perform password hashing and comparison, even if user not found
  const { passwd } = await getSaltedPassword(password, userCredential?.salt);
  const isValid = await comparePassword(
    passwd,
    userCredential?.password ||
      // dummy hash:
      '15f14decb3cb6314a074e15040ceb28068eee5d7709224f5f1620760053b',
  );

  if (isValid && user) {
    return user;
  }

  return null;
};

export const resetUserPassword = async (
  {
    email,
    password,
  }: {
    email: UserCredentials['email'];
    password: UserCredentials['password'];
  },
  {
    dbInstance = db,
  }: {
    dbInstance?: typeof db | Parameters<Parameters<(typeof db)['transaction']>[0]>[0];
  } = {
    dbInstance: db,
  },
) => {
  const { passwd, salt } = await getSaltedPassword(password);
  const hashedPassword = await hashPassword(passwd);
  return dbInstance
    .update(userCredentialsInHf)
    .set({
      salt,
      password: hashedPassword,
    })
    .where(eq(userCredentialsInHf.email, email))
    .returning();
};
