/**
 * Optional Sentry initialization.
 */
import * as Sentry from '@sentry/node';
import config from '../config';

export function initSentry() {
  if (!config.sentryDsn) return;
  Sentry.init({ dsn: config.sentryDsn, tracesSampleRate: 0 });
}
