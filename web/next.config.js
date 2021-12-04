const { withSentryConfig } = require("@sentry/nextjs");

const projectName = "home";
const {
  name: packageName,
  version: packageVersion,
} = require("./package.json");

const { API_BASE_URL, API_PUBLIC_BASE_URL } = process.env;
const { WEB_BASE_URL, WEB_PUBLIC_BASE_URL } = process.env;

const namespacedEnv = name => {
  const key = `${packageName.toUpperCase()}_${name}`;
  process.env[key] ?? process.env[name];
};

const sentryURL = namespacedEnv("SENTRY_URL");
const sentryOrg = namespacedEnv("SENTRY_ORG");
const sentryProject = namespacedEnv("SENTRY_PROJECT");
const sentryDSN = namespacedEnv("SENTRY_DSN");
const segmentWriteKey = namespacedEnv("SEGMENT_WRITE_KEY");

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
  publicRuntimeConfig: {
    projectName,
    packageName,
    packageVersion,
    apiPublicBaseURL: API_PUBLIC_BASE_URL,
    webPublicBaseURL: WEB_PUBLIC_BASE_URL,
    sentryDSN,
    segmentWriteKey,
  },
  serverRuntimeConfig: {
    projectName,
    packageName,
    packageVersion,
    apiBaseURL: API_BASE_URL,
    apiPublicBaseURL: API_PUBLIC_BASE_URL,
    webBaseURL: WEB_BASE_URL,
    webPublicBaseURL: WEB_PUBLIC_BASE_URL,
    sentryDSN,
    segmentWriteKey,
  },
};

if (!!sentryURL && !!sentryOrg && !!sentryProject) {
  /** @type {import('@sentry/webpack-plugin').SentryCliPluginOptions} */
  const sentryOptions = {
    silent: true,
    release: `${projectName}-${packageName}@${packageVersion}`,
  };
  module.exports = withSentryConfig(config, sentryOptions);
} else {
  const missingVariables = Object.entries({
    SENTRY_URL: sentryURL,
    SENTRY_ORG: sentryOrg,
    SENTRY_PROJECT: sentryProject,
  })
    .filter(([, value]) => !value)
    .map(([key]) => key);
  const missingVars = missingVariables.join(", ");
  console.warn(
    `[Sentry] Skip uploading sourcemaps (missing variables: ${missingVars})`,
  );
  module.exports = config;
}
