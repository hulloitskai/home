const { HOME_API_URL } = process.env;
const { AUTH0_DOMAIN, AUTH0_CLIENT_ID } = process.env;
const { GCP_API_KEY } = process.env;

module.exports = {
  productionBrowserSourceMaps: true,
  rewrites: async () => {
    if (!HOME_API_URL) {
      console.info("Missing API server URL; proxying is disabled.");
      return [];
    }
    return [
      {
        source: "/api/:slug*",
        destination: `${HOME_API_URL}/:slug*`,
      },
    ];
  },
  publicRuntimeConfig: {
    AUTH0_DOMAIN,
    AUTH0_CLIENT_ID,
    GCP_API_KEY,
  },
  serverRuntimeConfig: {
    AUTH0_DOMAIN,
    AUTH0_CLIENT_ID,
    GCP_API_KEY,
    HOME_API_URL,
  },
};
