import instance from "@/lib/axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ "error": "only POST requests allowed" })
  }

  const cookie = {
    name: 'session',
    options: { httpOnly: true, secure: true, path: '/', sameSite: "Strict" },
    duration: 24 * 60 * 60 * 1000,
  }

  const expiration = new Date(Date.now() + (cookie.duration))
  const id = req.body.id

  const { data } = await instance.post('/api/auth/encrypt', {
    id,
    expiration
  })


  const { session } = data

  res.setHeader(
    "Set-Cookie",
    `${cookie.name}=${session}; Path=${cookie.options.path}; Expires=${expiration.toUTCString()}; HttpOnly; Secure=${cookie.options.secure ? "True" : "False"}; SameSite=${cookie.options.sameSite}`
  );

  res.status(200).json({})
}
