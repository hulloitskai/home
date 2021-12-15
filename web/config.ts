import getConfig from "next/config";

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();
const {
  projectName,
  packageName,
  packageVersion,
  baseUrl,
  apiBaseUrl,
  sentryDSN,
  segmentWriteKey,
} = {
  ...publicRuntimeConfig,
  ...serverRuntimeConfig,
} as {
  projectName: string;
  packageName: string;
  packageVersion: string;
  baseUrl: string | undefined;
  apiBaseUrl: string | undefined;
  sentryDSN: string | undefined;
  segmentWriteKey: string | undefined;
};

export {
  projectName,
  packageName,
  packageVersion,
  apiBaseUrl,
  baseUrl,
  sentryDSN,
  segmentWriteKey,
};
