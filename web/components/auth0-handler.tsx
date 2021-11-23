import { initAuth0 } from "@auth0/nextjs-auth0";

import { webPublicBaseURL } from "config";

export const authSessionCookieName = "auth_session";
export const authRedirectCookieName = "auth_redirect";

const { handleAuth, handleLogin, handleLogout, handleCallback, getSession } =
  initAuth0({
    baseURL: webPublicBaseURL,
    session: {
      name: authSessionCookieName,
    },
  });

export { handleAuth, handleLogin, handleLogout, handleCallback, getSession };
