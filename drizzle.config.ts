import { defineConfig } from 'drizzle-kit';
import '~/services/import-env.server';

export default defineConfig({
  out: './drizzle',
  schema: './app/.server/db/schema',
  dialect: 'postgresql',
  verbose: true,
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ['hf'],
});
