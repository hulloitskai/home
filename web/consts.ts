import getConfig from "next/config";

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();

export const { HOME_API_URL, HOME_API_PUBLIC_URL } = {
  ...publicRuntimeConfig,
  ...serverRuntimeConfig,
} as any;
