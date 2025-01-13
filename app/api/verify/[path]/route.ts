'use server'
import { prisma } from "../../../_lib/prisma";
import { decrypt } from "../../../_lib/mail";
import { createSession } from "@/app/_lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string }> }
) {
  const path = (await params).path

  try {
    const decryptedData = await decrypt(decodeURIComponent(path));

    if (decryptedData === null) {
      return new Response("invalid URL", {
        status: 400
      })
    }

    if (!decryptedData.email || !decryptedData.name || !decryptedData.password) {
      return new Response("invalid URL", {
        status: 400
      })
    }

    const { email, name, password } = decryptedData

    if (typeof email !== 'string' || typeof name !== 'string' || typeof password !== 'string') {
      return new Response("invalid URL", {
        status: 400
      })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new Response("User Exists", {
        status: 400
      })
    }

    const user = await prisma.user.create({
      data: {
        uname: name,
        email: email,
        password: password,
        xp: 0,
        rankId: 1,
      },
      select: {
        id: true,
      },
    });

    await createSession(user.id);

    return new Response("Session Created", {
      status: 201
    })

  } catch (error) {
    console.error("Verification failed:", error);
  }
}

