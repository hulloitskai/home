import { initAuth0 } from "@auth0/nextjs-auth0";

import { baseUrl } from "config";

export const authSessionCookieName = "auth_session";
export const authRedirectCookieName = "auth_redirect";

const { handleAuth, handleLogin, handleLogout, handleCallback, getSession } =
  initAuth0({
    baseURL: baseUrl,
    session: {
      name: authSessionCookieName,
    },
  });

export { handleAuth, handleLogin, handleLogout, handleCallback, getSession };
