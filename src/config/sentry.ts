import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

export const initializeSentry = () => {
  if (!process.env.SENTRY_DSN) {
    console.log("Sentry disabled - no DSN provided");
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    enabled: !!process.env.SENTRY_DSN,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
};

// Hata yakalama helper'ı
export const captureException = (
  error: Error,
  extras?: Record<string, any>
) => {
  if (!process.env.SENTRY_DSN) return;

  Sentry.captureException(error, {
    extra: extras,
  });
};
