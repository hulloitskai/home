const { withSentryConfig } = require("@sentry/nextjs");

const HOME_VERSION = process.env.npm_package_version;
const { HOME_API_BASE_URL, HOME_API_PUBLIC_BASE_URL } = process.env;
const { AUTH0_DOMAIN, AUTH0_CLIENT_ID } = process.env;

const { SENTRY_URL, SENTRY_ORG, SENTRY_PROJECT, SENTRY_DSN } = process.env;

/** @type {import('next').NextConfig} */
const config = {
  swcMinify: true,
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
    HOME_VERSION,
    HOME_API_PUBLIC_BASE_URL,
    SENTRY_DSN,
    AUTH0_DOMAIN,
    AUTH0_CLIENT_ID,
  },
  serverRuntimeConfig: {
    HOME_VERSION,
    HOME_API_BASE_URL,
    SENTRY_DSN,
    AUTH0_DOMAIN,
    AUTH0_CLIENT_ID,
  },
};

if (!!SENTRY_URL && !!SENTRY_ORG && !!SENTRY_PROJECT) {
  const { name, version } = require("./package.json");

  /** @type {import('@sentry/webpack-plugin').SentryCliPluginOptions} */
  const sentryOptions = {
    silent: true,
    release: `${name}@${version}`,
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
