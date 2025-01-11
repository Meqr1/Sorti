import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import instance from "./lib/axios";

export default async function middleware(req: NextRequest) {
  const proctedRotes = ['/app']
  const currentPath = req.nextUrl.pathname
  const isProctedRoute = proctedRotes.includes(currentPath)

  if (isProctedRoute) {
    const cookieStore = await cookies()
    const cookie = cookieStore.get('session')?.value
    const session = await instance.post('/api/auth/decrypt', {
      session: cookie
    })

    if (!session.data.id) {
      return NextResponse.redirect(new URL('/auth/login', req.nextUrl))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image).*)']
}
