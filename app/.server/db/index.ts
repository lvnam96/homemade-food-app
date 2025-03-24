// For implement local DB development:
// https://neon.tech/guides/local-development-with-neon
// https://github.com/TimoWilhelm/local-neon-http-proxy
// - For Pool connection (uses websocket): https://neon.tech/guides/drizzle-local-vercel
// - For serverless (uses fetch): https://neon.tech/guides/local-development-with-neon

import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle as neonServerlessDrizzle } from 'drizzle-orm/neon-serverless'; // use `'drizzle-orm/neon-http'` for normal HTTP connection on serverless platforms
import { drizzle as neonHttpDrizzle } from 'drizzle-orm/neon-http'; // use `'drizzle-orm/neon-http'` for normal HTTP connection on serverless platforms
import invariant from 'tiny-invariant';
import ws from 'ws';

import '~/.server/utils/import-env';

invariant(process.env.DATABASE_URL, 'DATABASE_URL is not set');
const connectionString = process.env.DATABASE_URL;

neonConfig.webSocketConstructor = ws; // for Pool connection

// NOTE: must use `process.env` instead of `import.meta.env` since `import.meta.env` is not available in custom scripts run with `node` (see `package.json`). See also: https://vite.dev/guide/env-and-mode#node-env-and-modes
if (process.env.NODE_ENV === 'production') {
  // @ts-expect-error `EdgeRuntime` is defined only on Vercel's edge runtime
  if (typeof EdgeRuntime !== 'undefined') {
    // NOTE: https://github.com/vercel/next.js/discussions/53869#discussioncomment-9308065
    neonConfig.poolQueryViaFetch = true; // to work in edge environments (Cloudflare Workers, Vercel Edge, etc.)
  }
} else {
  // Setting up offline local development:
  // 1. For Fetch (HTTP) connection:
  neonConfig.fetchEndpoint = (host) => {
    const [protocol, port] = host === 'db.localtest.me' ? ['http', 4444] : ['https', 443];
    return `${protocol}://${host}:${port}/sql`;
  };
  // 2. For Pool (WebSocket) connection:
  // const connectionStringUrl = new URL(connectionString);
  neonConfig.wsProxy = (host) => `${host}:4444/v1`;
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;
  neonConfig.forceDisablePgSSL = true;
}

export const db = neonHttpDrizzle({
  connection: {
    connectionString,
    // TODO: check if this works (`neonDrizzle` has not supported this yet according to its typing):
    // max: process.env.DB_MIGRATING || process.env.DB_SEEDING ? 1 : undefined,
  },
  casing: 'snake_case',
});

export const createPooledDBConnection = () => {
  const pool = new Pool({
    connectionString,
    max: process.env.DB_MIGRATING || process.env.DB_SEEDING ? 1 : undefined,
  });
  const db = neonServerlessDrizzle(pool, {
    ...neonConfig,
    casing: 'snake_case',
  });
  return { pool, db };
};

export type DrizzleDBPooledInstance = ReturnType<typeof createPooledDBConnection>['db'];
export type DrizzleDBInstance = typeof db | DrizzleDBPooledInstance;
export type DrizzleDBInstanceInTransaction = Parameters<Parameters<DrizzleDBPooledInstance['transaction']>[0]>[0];
