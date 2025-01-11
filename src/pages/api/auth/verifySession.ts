import instance from "@/lib/axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const cookie = req.cookies.session

  const session = await instance.post('/api/auth/decrypt', {
    "session": cookie
  })

  if (!session?.data.id) {
    return res.status(401).json({"error": "failed to authorize return to /auth/login"})
  }

  res.status(200).json({ id: session?.data.id })
}
