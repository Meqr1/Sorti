'use server'
import { prisma } from "@/app/_lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  console.log("GETREQUEST:::::::::::::::::::::::::::::::::::::;;;;;;;")
  const cookiesStore = await cookies()
  const refreshToken = cookiesStore.get('refresh')?.value

  if (!refreshToken) {
    console.log(refreshToken)
    return NextResponse.json(
      { error: "token not valid" },  // Correct JSON structure
      { status: 401 }            // Optional status configuration
    );
  }

  const refreshJSON = await prisma.refreshToken.findFirst({
    where: {
      token: refreshToken,
      isRevoked: false,
      expiresAt: {
        gt: new Date()
      }
    }
  })

  if (!refreshJSON) {
    return new Response("token not valid", {
      status: 401,
    })
  }

  return NextResponse.json(
    { refresh: refreshJSON },  // Correct JSON structure
    { status: 200 }            // Optional status configuration
  );
}

export async function POST(req: Request) {
  const { userId, expiresAt, token } = await req.json()

  try {
    const response = await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
        isRevoked: false
      }
    })

    return NextResponse.json(
      { refreshToken: response },
      { status: 200 }
    )
  } catch (err) {
    return NextResponse.json(
      { error: err },
      { status: 500 }
    )
  }
}
