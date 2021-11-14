import { init } from "@sentry/nextjs";
import { CaptureConsole } from "@sentry/integrations";
import { excludeGraphQLFetch } from "apollo-link-sentry";

import { SENTRY_DSN } from "consts";

init({
  dsn: SENTRY_DSN,
  integrations: [new CaptureConsole({ levels: ["error"] })],
  tracesSampleRate: 0,
  beforeBreadcrumb: excludeGraphQLFetch,
});
