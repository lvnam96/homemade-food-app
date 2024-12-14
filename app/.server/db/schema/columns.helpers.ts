import { timestamp } from 'drizzle-orm/pg-core';

export const createTimestampColumns = (colName: string, config: Parameters<typeof timestamp>[1] = {}) =>
  timestamp(colName, {
    withTimezone: true,
    mode: 'date',
    ...config,
  });

export const entityTimestampColumns = {
  createdAt: createTimestampColumns('created_at').defaultNow().notNull(),
  updatedAt: createTimestampColumns('updated_at'),
  deletedAt: createTimestampColumns('deleted_at'),
};
