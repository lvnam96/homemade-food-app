import { defineConfig } from 'drizzle-kit';
import '~/services/import-env.server';

export default defineConfig({
  out: './app/.server/db/schema',
  schema: './app/.server/db/schema/index.ts',
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
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ['public', 'hf'],
  // extensionsFilters: ['postgis'],
});
