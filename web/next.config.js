const { withSentryConfig } = require("@sentry/nextjs");

const projectName = "home";
const {
  name: packageName,
  version: packageVersion,
} = require("./package.json");

const { ENV, BASE_URL } = process.env;
process.env.NODE_ENV = ENV;

const { API_BASE_URL } = process.env;
const { SENTRY_URL, SENTRY_ORG, SENTRY_PROJECT, SENTRY_DSN } = process.env;
const { SEGMENT_WRITE_KEY } = process.env;

const commonRuntimeConfig = {
  projectName,
  packageName,
  packageVersion,
  baseUrl: BASE_URL,
  apiBaseUrl: API_BASE_URL,
  sentryDSN: SENTRY_DSN,
  segmentWriteKey: SEGMENT_WRITE_KEY,
};

/** @type {import('next').NextConfig} */
const config = {
  swcMinify: true,
  reactStrictMode: true,
  headers: async () => [
    {
      source: "/fonts/:font",
      headers: [
        {
          key: "Access-Control-Allow-Origin",
          value: "*",
        },
      ],
    },
  ],
  publicRuntimeConfig: { ...commonRuntimeConfig },
  serverRuntimeConfig: { ...commonRuntimeConfig },
};

if (!!SENTRY_URL && !!SENTRY_ORG && !!SENTRY_PROJECT) {
  /** @type {import('@sentry/webpack-plugin').SentryCliPluginOptions} */
  const sentryOptions = {
    silent: true,
    release: `${projectName}-${packageName}@${packageVersion}`,
  };
  module.exports = withSentryConfig(config, sentryOptions);
} else {
  const missingVariables = Object.entries({
    SENTRY_URL: SENTRY_URL,
    SENTRY_ORG: SENTRY_ORG,
    SENTRY_PROJECT: SENTRY_PROJECT,
  })
    .filter(([, value]) => !value)
    .map(([key]) => key);
  const missingVars = missingVariables.join(", ");
  console.warn(
    `[Sentry] Skip uploading sourcemaps (missing variables: ${missingVars})`,
  );
  module.exports = config;
}
