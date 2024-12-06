import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

// drizzle schema implementation based on `../sql/schema.sql`

export const emailDomainsTable = pgTable('hf.email_domains', {
  id: serial('id').primaryKey(),
  domain: text('domain').notNull(),
});

export const usersTable = pgTable('hf.users', {
  id: serial('id').primaryKey(),
  username: varchar('name').notNull(),
});
