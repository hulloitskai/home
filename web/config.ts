import getConfig from "next/config";

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();
const {
  projectName,
  packageName,
  packageVersion,
  apiBaseURL,
  apiPublicBaseURL,
  webBaseURL,
  webPublicBaseURL,
  sentryDSN,
  segmentWriteKey,
} = {
  ...publicRuntimeConfig,
  ...serverRuntimeConfig,
} as {
  projectName: string;
  packageName: string;
  packageVersion: string;
  apiBaseURL: string | undefined;
  apiPublicBaseURL: string | undefined;
  webBaseURL: string | undefined;
  webPublicBaseURL: string | undefined;
  sentryDSN: string | undefined;
  segmentWriteKey: string | undefined;
};

export {
  projectName,
  packageName,
  packageVersion,
  apiBaseURL,
  apiPublicBaseURL,
  webBaseURL,
  webPublicBaseURL,
  sentryDSN,
  segmentWriteKey,
};
