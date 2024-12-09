// For implement local DB development:
// https://neon.tech/guides/local-development-with-neon
// https://github.com/TimoWilhelm/local-neon-http-proxy
// https://github.com/TimoWilhelm/local-neon-http-proxy/issues/3

import { neon /* , Pool as NeonPool */ } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-http';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
// import { Pool as PgPool } from 'pg';

import '~/services/import-env.server';

const connectionString = process.env.DATABASE_URL!;

export const db =
  process.env.NODE_ENV === 'production' ? neonDrizzle(neon(connectionString)) : pgDrizzle(connectionString);

// FIXME: this code throws error: "PgPool is not exported from `pg` package"
// export const createDBConnectionPool = () => {
//   if (process.env.NODE_ENV === 'production') {
//     return new NeonPool({ connectionString });
//   } else {
//     return new PgPool({ connectionString });
//   }
// };
