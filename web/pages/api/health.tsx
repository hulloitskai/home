import type { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  return res.send("ok");
};

export default handler;
