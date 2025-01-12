import instance from "@/lib/axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ "error": "Only POST requests allowed" });
  }

  const cookie = {
    name: 'session',
    options: { httpOnly: true, secure: process.env.NODE_ENV === "production", path: '/', sameSite: "Strict" },
    duration: 24 * 60 * 60 * 1000,  // 24 hours
  };

  const expiration = new Date(Date.now() + cookie.duration);
  const id = req.body.id;

  try {
    const { data } = await instance.post('/api/auth/encrypt', {
      id,
      expiration
    });

    const { session } = data;

    res.setHeader(
      "Set-Cookie",
      `${cookie.name}=${session}; Path=${cookie.options.path}; Expires=${expiration.toUTCString()}; HttpOnly; Secure=${cookie.options.secure ? "True" : "False"}; SameSite=${cookie.options.sameSite}`
    );

    return res.status(201).json({
      success: true,
    });

  } catch (error) {
    console.error("Failed to create session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
}

