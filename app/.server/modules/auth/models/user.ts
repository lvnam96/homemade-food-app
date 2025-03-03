// NOTE: `dbInstance` prop applies "dependencies injection" pattern for testing

import { eq, getTableName, sql } from 'drizzle-orm';
import { userCredentialsInHf, usersInHf } from '~/.server/db/schema';
import type { UserCredentials, UserCredentialsForInsert, UserDataForInsert } from '../types';
import { pick } from '~/utils/data';
import { db } from '~/.server/db';
// import { bigint, date, object, orNull, string } from '@adllang/jsonbinding';
import { comparePassword, getSaltedPassword } from '~/.server/utils/password';

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
    dbInstance?: typeof db;
  } = {
    dbInstance: db,
  },
) =>
  // `SELECT * FROM ${usersInHf} WHERE ${usersInHf.id} = ${id}`
  dbInstance
    .select()
    .from(usersInHf)
    .where(eq(usersInHf.id, BigInt(id)));

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
    dbInstance?: typeof db;
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
  user: Omit<UserCredentialsForInsert, 'userId' | 'updatedAt'> & UserDataForInsert,
  {
    dbInstance = db,
  }: {
    dbInstance?: typeof db;
  } = {
    dbInstance: db,
  },
) => {
  // `INSERT INTO ${usersInHf} (${usersInHf.displayName}, ${usersInHf.phoneNumber}) VALUES (${user.email}, ${null}) RETURNING *`
  const [userRes] = await dbInstance
    .insert(usersInHf)
    .values(pick(user, ['displayedName', 'phoneNumber']))
    .returning();

  // `INSERT INTO ${userCredentialsInHf} (${userCredentialsInHf.password}, ${userCredentialsInHf.salt}, ${userCredentialsInHf.email}, ${userCredentialsInHf.userId}) VALUES (${hashedPassword}, ${user.email}, ${userRes[0].id}) RETURNING *`
  const [userCredentialsRes] = await dbInstance
    .insert(userCredentialsInHf)
    .values({
      ...pick(user, ['password', 'salt', 'email']),
      userId: userRes.id,
    })
    .returning();

  return { ...userRes, email: userCredentialsRes.email };
};

export const verifyUserPassword = async (
  email: UserCredentials['email'],
  password: UserCredentials['password'],
  {
    dbInstance = db,
  }: {
    dbInstance?: typeof db;
  } = {
    dbInstance: db,
  },
) => {
  if (typeof email !== 'string' || !email || typeof password !== 'string' || !password) {
    return null;
  }

  // `SELECT DISTINCT * FROM ${userCredentialsInHf} INNER JOIN ${usersInHf} on ${userCredentialsInHf.userId} = ${usersInHf.id} WHERE ${userCredentialsInHf.email} = ${email}`
  const rows = await dbInstance
    .selectDistinct()
    .from(userCredentialsInHf)
    .where(eq(userCredentialsInHf.email, normalizeEmail(email)))
    .innerJoin(usersInHf, eq(userCredentialsInHf.userId, usersInHf.id));

  if (!rows.length || !rows[0]) return null;
  const { [getTableName(usersInHf)]: user, [getTableName(userCredentialsInHf)]: userCredential } = rows[0];
  if (!userCredential?.password) return null;

  const { passwd } = await getSaltedPassword(password, userCredential.salt);
  const isValid = await comparePassword(passwd, userCredential.password);
  if (!isValid) return null;

  return user;
};

export const resetUserPassword = async ({
  email,
  password,
}: {
  email: UserCredentials['email'];
  password: UserCredentials['password'];
}) => {
  const { passwd, salt } = await getSaltedPassword(password);
  return db
    .update(userCredentialsInHf)
    .set({
      salt,
      password: passwd,
    })
    .where(eq(userCredentialsInHf.email, email))
    .returning();
};
