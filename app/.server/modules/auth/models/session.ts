// NOTE: `dbInstance` prop applies "dependencies injection" pattern for testing

import { and, eq, gt } from 'drizzle-orm';
import { db, type DrizzleDBInstanceInTransaction } from '~/.server/db';
import { authSessionsInHf } from '~/.server/db/schema';
import type { Session } from '../types';

export const getAuthSessionById = async (
  sessionId: string,
  {
    dbInstance = db,
  }: {
    dbInstance?: typeof db | DrizzleDBInstanceInTransaction;
  } = {
    dbInstance: db,
  },
): Promise<Session | null> =>
  // `SELECT * FROM ${authSessionsInHf} WHERE ${authSessionsInHf.id} = ${id}`
  (
    await dbInstance
      .select()
      .from(authSessionsInHf)
      .where(and(eq(authSessionsInHf.id, BigInt(sessionId)), gt(authSessionsInHf.expiredAt, new Date())))
  )[0];

export const deleteAuthSessionById = async (
  sessionId: string,
  {
    dbInstance = db,
  }: {
    dbInstance?: typeof db | DrizzleDBInstanceInTransaction;
  } = {
    dbInstance: db,
  },
): Promise<Session | null> =>
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
    dbInstance?: typeof db | DrizzleDBInstanceInTransaction;
  } = {
    dbInstance: db,
  },
): Promise<Session[]> =>
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
    dbInstance?: typeof db | DrizzleDBInstanceInTransaction;
  } = {
    dbInstance: db,
  },
): Promise<Session[]> =>
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
    dbInstance?: typeof db | DrizzleDBInstanceInTransaction;
  } = {
    dbInstance: db,
  },
): Promise<Session> =>
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
