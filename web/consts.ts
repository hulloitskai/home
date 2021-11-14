import getConfig from "next/config";

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();

export const {
  HOME_VERSION,
  HOME_API_BASE_URL,
  HOME_API_PUBLIC_BASE_URL,
  SENTRY_DSN,
  AUTH0_DOMAIN,
  AUTH0_CLIENT_ID,
} = {
  ...publicRuntimeConfig,
  ...serverRuntimeConfig,
} as any;
