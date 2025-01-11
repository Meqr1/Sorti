import { SignJWT } from "jose";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({"error": "only POST requests allowed"})
  }

  const key = new TextEncoder().encode(process.env.AUTH_SECRET)
  const payload = req.body

  const response = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime('1day')
    .sign(key)

  res.status(200).json({ "session": response })
}
