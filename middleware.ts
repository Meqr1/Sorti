import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./app/_lib/session";

export default async function middleware(req: NextRequest) {
  const protectedRoutes = ['/app']
  const redirectAppRoutes = ['/signup', '/login']
  const currentPath = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(currentPath)
  const isRedirectRoute = redirectAppRoutes.includes(currentPath)

  if (isProtectedRoute) {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', req.nextUrl))
    }

    const session = await decrypt(sessionCookie)

    if (!session?.userId) {
      return NextResponse.redirect(new URL('/login', req.nextUrl))
    }
  }

  if (isRedirectRoute) {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return NextResponse.next()
    }

    const session = await decrypt(sessionCookie)

    if (session?.userId) {
      return NextResponse.redirect(new URL('/app', req.nextUrl))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image).*)']
}
