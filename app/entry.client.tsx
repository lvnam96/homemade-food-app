/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import * as Sentry from '@sentry/remix';
import { RemixBrowser, useLocation, useMatches } from '@remix-run/react';
import { startTransition, StrictMode, useEffect } from 'react';
import { hydrateRoot } from 'react-dom/client';

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1,

  integrations: [
    Sentry.browserTracingIntegration({
      useEffect,
      useLocation,
      useMatches,
    }),
    // // eslint-disable-next-line import/namespace
    // Sentry.feedbackIntegration({
    //   // this adds ~17KB to the bundle size (gzipped)
    //   colorScheme: 'system',
    //   enableScreenshot: true,
    // }),
  ],

  // beforeSend(event, _hint) {
  //   // Check if it is an exception, and if so, show the report dialog
  //   if (event.exception && event.event_id) {
  //     const tokenData = decodeToken<AccessTokenData>(getCookie(tokenNames.ACCESS_TOKEN));
  //     Sentry.showReportDialog({
  //       eventId: event.event_id,
  //       user: tokenData
  //         ? {
  //             name: '' + tokenData.identity,
  //             email: tokenData.name,
  //           }
  //         : undefined,
  //     });
  //   }
  //   return event;
  // },
});

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
  );
});
