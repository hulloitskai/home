import type { NextApiHandler } from "next";

import { getSession } from "components/auth0-handler";

const handler: NextApiHandler = async (req, res) => {
  const session = await getSession(req, res);
  const { accessToken, accessTokenExpiresAt } = session ?? {};

  if (accessToken && accessTokenExpiresAt) {
    const now = Math.round(new Date().getTime() / 1000);
    const maxAge = accessTokenExpiresAt - now;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", `private, max-age=${maxAge}`);
    return res.send(accessToken);
  }

  return res.status(204).end();
};

export default handler;
