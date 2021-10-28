const { HOME_API_URL, HOME_API_PUBLIC_URL } = process.env;
const { AUTH0_DOMAIN, AUTH0_CLIENT_ID } = process.env;
const { GCP_API_KEY } = process.env;

/**
 * @type {import('next').NextConfig}
 **/
const config = {
  productionBrowserSourceMaps: true,
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
    AUTH0_DOMAIN,
    AUTH0_CLIENT_ID,
    GCP_API_KEY,
    HOME_API_PUBLIC_URL,
  },
  serverRuntimeConfig: {
    AUTH0_DOMAIN,
    AUTH0_CLIENT_ID,
    GCP_API_KEY,
    HOME_API_URL,
  },
};

module.exports = config;
