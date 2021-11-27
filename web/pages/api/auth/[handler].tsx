import type { NextApiHandler, NextApiResponse } from "next";
import { serialize as serializeCookie } from "cookie";
import type { CookieSerializeOptions as SerializeCookieOptions } from "cookie";

import { authRedirectCookieName } from "components/auth0-handler";
import {
  handleAuth,
  handleLogout,
  handleCallback,
} from "components/auth0-handler";

import { webPublicBaseURL } from "config";

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

const authHandler = handleAuth({
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

const handler: NextApiHandler = (req, res) => {
  const { query } = req;
  query.auth0 = query.handler;
  return authHandler(req, res);
};

export default handler;
