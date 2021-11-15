import { init } from "@sentry/nextjs";
import { CaptureConsole } from "@sentry/integrations";
import { excludeGraphQLFetch } from "apollo-link-sentry";

import { sentryDSN } from "config";

init({
  dsn: sentryDSN,
  integrations: [new CaptureConsole({ levels: ["error"] })],
  tracesSampleRate: 0,
  beforeBreadcrumb: excludeGraphQLFetch,
});
