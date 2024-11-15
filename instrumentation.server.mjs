import * as Sentry from '@sentry/remix';

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  tracesSampleRate: import.meta.env.DEV ? 0 : 1,
  autoInstrumentRemix: true,
});
