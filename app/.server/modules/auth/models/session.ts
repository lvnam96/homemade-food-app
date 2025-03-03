// NOTE: `dbInstance` prop applies "dependencies injection" pattern for testing

import { and, eq, gt } from 'drizzle-orm';
import { db } from '~/.server/db';
import { authSessionsInHf } from '~/.server/db/schema';

export const getAuthSessionById = async (
  sessionId: string,
  {
    dbInstance = db,
  }: {
    dbInstance?: typeof db;
  } = {
    dbInstance: db,
  },
) =>
  // `SELECT * FROM ${authSessionsInHf} WHERE ${authSessionsInHf.id} = ${id}`
  (
    await dbInstance
      .selectDistinct()
      .from(authSessionsInHf)
      .where(and(eq(authSessionsInHf.id, BigInt(sessionId)), gt(authSessionsInHf.expiredAt, new Date())))
  )[0];

export const deleteAuthSessionById = async (
  sessionId: string,
  {
    dbInstance = db,
  }: {
    dbInstance?: typeof db;
  } = {
    dbInstance: db,
  },
) =>
  // `DELETE FROM ${authSessionsInHf} WHERE ${authSessionsInHf.id} = ${id} RETURNING *`;
  (
    await dbInstance
      .delete(authSessionsInHf)
      .where(eq(authSessionsInHf.id, BigInt(sessionId)))
      .returning()
  )[0];

export const getAllAuthSessionsByUserId = async (
  userId: string,
  {
    dbInstance = db,
  }: {
    dbInstance?: typeof db;
  } = {
    dbInstance: db,
  },
) =>
  // `SELECT * FROM ${authSessionsInHf} WHERE ${authSessionsInHf.userId} = ${userId}`
  await dbInstance
    .select()
    .from(authSessionsInHf)
    .where(eq(authSessionsInHf.userId, BigInt(userId)));

export const deleteAllAuthSessionsByUserId = async (
  userId: string,
  {
    dbInstance = db,
  }: {
    dbInstance?: typeof db;
  } = {
    dbInstance: db,
  },
) =>
  // `DELETE FROM ${authSessionsInHf} WHERE ${authSessionsInHf.userId} = ${userId} RETURNING *`;
  await dbInstance
    .delete(authSessionsInHf)
    .where(eq(authSessionsInHf.userId, BigInt(userId)))
    .returning();

export const createAuthSession = async (
  {
    expiredAt,
    userId,
  }: {
    expiredAt: Date;
    userId: string;
  },
  {
    dbInstance = db,
  }: {
    dbInstance?: typeof db;
  } = {
    dbInstance: db,
  },
) =>
  // `INSERT INTO ${authSessionsInHf} (${authSessionsInHf.expiredAt}, ${authSessionsInHf.userId}) VALUES (${expiredAt}, ${userId}) RETURNING *`
  (
    await dbInstance
      .insert(authSessionsInHf)
      .values({
        expiredAt,
        userId: BigInt(userId),
      })
      .returning()
  )[0];
