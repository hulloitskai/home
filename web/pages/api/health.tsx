import type { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  return res.send("OK");
};

export default handler;
