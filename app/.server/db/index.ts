// For implement local DB development:
// https://neon.tech/guides/local-development-with-neon
// https://github.com/TimoWilhelm/local-neon-http-proxy
// - For Pool connection (uses websocket): https://neon.tech/guides/drizzle-local-vercel
// - For serverless (uses fetch): https://neon.tech/guides/local-development-with-neon

import { neonConfig } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-http';
import invariant from 'tiny-invariant';

import '~/services/import-env.server';

invariant(process.env.DATABASE_URL, 'DATABASE_URL is not set');
const connectionString = process.env.DATABASE_URL;

// neonConfig.webSocketConstructor = ws; // for Pool connection
if (process.env.NODE_ENV === 'production') {
  // @ts-expect-error `EdgeRuntime` is defined only on Vercel's edge runtime
  if (typeof EdgeRuntime !== 'undefined') {
    // NOTE: https://github.com/vercel/next.js/discussions/53869#discussioncomment-9308065
    neonConfig.poolQueryViaFetch = true; // to work in edge environments (Cloudflare Workers, Vercel Edge, etc.)
  }
} else {
  // For offline local development:
  neonConfig.fetchEndpoint = (host) => {
    const [protocol, port] = host === 'db.localtest.me' ? ['http', 4444] : ['https', 443];
    return `${protocol}://${host}:${port}/sql`;
  };
  // For Pool connection, use this instead of setting `fetchEndpoint`:
  // const connectionStringUrl = new URL(connectionString);
  // neonConfig.wsProxy = (host) => `${host}:4444/v1`;
  // neonConfig.webSocketConstructor = ws;
  // neonConfig.useSecureWebSocket = false;
  // neonConfig.pipelineTLS = false;
  // neonConfig.pipelineConnect = false;
  // neonConfig.forceDisablePgSSL = true;
}

export const db = neonDrizzle({
  connection: {
    connectionString,
    // TODO: check if this works (`neonDrizzle` has not supported this yet according to its typing):
    // max: process.env.DB_MIGRATING || process.env.DB_SEEDING ? 1 : undefined,
  },
  casing: 'snake_case',
});
