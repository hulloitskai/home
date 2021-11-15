import getConfig from "next/config";

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();

const {
  pkgName,
  pkgVersion,
  apiBaseURL,
  apiPublicBaseURL,
  webBaseURL,
  webPublicBaseURL,
  sentryDSN,
} = {
  ...publicRuntimeConfig,
  ...serverRuntimeConfig,
} as any;

export {
  pkgName,
  pkgVersion,
  apiBaseURL,
  apiPublicBaseURL,
  webBaseURL,
  webPublicBaseURL,
  sentryDSN,
};
