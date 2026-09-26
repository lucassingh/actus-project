import * as Sentry from "@sentry/nextjs";

// Without a DSN (local dev, CI) Sentry stays off.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  tracesSampleRate: 0.1,
});
