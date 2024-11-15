import * as Sentry from '@sentry/remix';

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1,
  autoInstrumentRemix: true,
});
