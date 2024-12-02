import * as Sentry from '@sentry/remix';
import { config } from 'dotenv';

config({ path: '.env' });

Sentry.init({
  dsn: process.env.PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 0 : 1,
  autoInstrumentRemix: true,
});
