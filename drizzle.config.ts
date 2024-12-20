import { defineConfig } from 'drizzle-kit';
import invariant from 'tiny-invariant';
import '~/services/import-env.server';

invariant(process.env.DATABASE_URL, 'DATABASE_URL is not set');

export default defineConfig({
  out: './app/.server/db/migrations',
  schema: './app/.server/db/schema.ts',
  dialect: 'postgresql',
  breakpoints: false,
  verbose: true,
  strict: true,
  entities: {
    roles: {
      provider: 'neon',
    },
  },
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  schemaFilter: ['public', 'hf'],
  // extensionsFilters: ['postgis'],
});
