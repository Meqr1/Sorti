import { jwtVerify } from "jose";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({"error": "only POST method allowed"})
  }

  const session = req.body.session
  const key = new TextEncoder().encode(process.env.AUTH_SECRET)

  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    })
    res.status(200).json({...payload})
  } catch (error) {
    res.status(500).json({"error": error.message})
  }
}
