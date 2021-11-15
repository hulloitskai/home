import type { NextApiHandler } from "next";

import { getSession } from "components/auth0";

const handler: NextApiHandler = async (req, res) => {
  const { accessToken, accessTokenExpiresAt } =
    (await getSession(req, res)) ?? {};
  if (accessToken && accessTokenExpiresAt) {
    const now = Math.round(new Date().getTime() / 1000);
    const maxAge = accessTokenExpiresAt - now;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", `private, max-age=${maxAge}`);
    res.send(accessToken);
  } else {
    res.status(204);
  }
};

export default handler;
