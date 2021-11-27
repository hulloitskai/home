const { withSentryConfig } = require("@sentry/nextjs");

const { name: pkgName, version: pkgVersion } = require("./package.json");

const { API_BASE_URL, API_PUBLIC_BASE_URL } = process.env;
const { WEB_BASE_URL, WEB_PUBLIC_BASE_URL } = process.env;

const { SENTRY_URL, SENTRY_ORG, SENTRY_PROJECT, SENTRY_DSN } = process.env;

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
    pkgName,
    pkgVersion,
    apiPublicBaseURL: API_PUBLIC_BASE_URL,
    webPublicBaseURL: WEB_PUBLIC_BASE_URL,
    sentryDSN: SENTRY_DSN,
  },
  serverRuntimeConfig: {
    pkgName,
    pkgVersion,
    apiBaseURL: API_BASE_URL,
    apiPublicBaseURL: API_PUBLIC_BASE_URL,
    webBaseURL: WEB_BASE_URL,
    webPublicBaseURL: WEB_PUBLIC_BASE_URL,
    sentryDSN: SENTRY_DSN,
  },
};

if (!!SENTRY_URL && !!SENTRY_ORG && !!SENTRY_PROJECT) {
  /** @type {import('@sentry/webpack-plugin').SentryCliPluginOptions} */
  const sentryOptions = {
    silent: true,
    release: `${pkgName}@${pkgVersion}`,
  };

  module.exports = withSentryConfig(config, sentryOptions);
} else {
  const missingVariables = Object.entries({
    SENTRY_URL,
    SENTRY_ORG,
    SENTRY_PROJECT,
  })
    .filter(([, value]) => !value)
    .map(([key]) => key);

  console.warn(
    `[Sentry] Skip uploading sourcemaps (missing variables: ${missingVariables.join(
      ", ",
    )})`,
  );
  module.exports = config;
}
