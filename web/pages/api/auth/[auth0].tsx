import type { NextApiResponse } from "next";
import { serialize as serializeCookie } from "cookie";
import type { CookieSerializeOptions as SerializeCookieOptions } from "cookie";

import { initAuth0 } from "@auth0/nextjs-auth0";

import { webPublicBaseURL } from "config";

const authSessionCookieName = "auth_session";
const authRedirectCookieName = "auth_redirect";

const { handleAuth, handleLogout, handleCallback } = initAuth0({
  baseURL: webPublicBaseURL,
  session: {
    name: authSessionCookieName,
  },
});

export const setCookie = (
  res: NextApiResponse,
  name: string,
  value: string,
  options: SerializeCookieOptions = {},
) => {
  if (options.maxAge) {
    options.expires = new Date(Date.now() + options.maxAge * 1000);
  }
  const cookie = serializeCookie(name, value, options);
  res.setHeader("Set-Cookie", cookie);
};

export default handleAuth({
  logout: (req, res, options = {}) => {
    const { returnTo: returnToParam } = req.query;
    const returnTo = Array.isArray(returnToParam)
      ? returnToParam[0]
      : returnToParam;
    setCookie(res, authRedirectCookieName, returnTo || "/", {
      httpOnly: true,
      maxAge: 300,
    });
    return handleLogout(req, res, {
      ...options,
      returnTo: `${webPublicBaseURL}/api/auth/callback`,
    });
  },
  callback: async (req, res, options) => {
    const redirectURL = req.cookies[authRedirectCookieName];
    if (redirectURL) {
      setCookie(res, authRedirectCookieName, "", {
        httpOnly: true,
        maxAge: -1,
      });
      return res.redirect(redirectURL).end();
    }
    return handleCallback(req, res, options);
  },
});
