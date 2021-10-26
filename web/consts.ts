import getConfig from "next/config";

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();

export const { HOME_API_URL } = {
  ...publicRuntimeConfig,
  ...serverRuntimeConfig,
} as any;
