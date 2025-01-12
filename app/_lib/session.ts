import 'server-only'
import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const key = new TextEncoder().encode(process.env.AUTH_SECRET)

const cookie = {
  name: 'session',
  options: { httpOnly: true, secure: true, sameSite: true, path: '/' },
  duration: 24 * 60 * 60 * 1000
}

export async function encrypt(payload: JWTPayload | undefined) {
  return new SignJWT(payload)
    .setIssuedAt()
    .setExpirationTime('1day')
    .setProtectedHeader({ alg: 'HS256' })
    .sign(key)
}

export async function decrypt(session: string) {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256']
    })
    return payload
  } catch {
    return null
  }
}

export async function createSession(userId: number) {
  const expires = new Date(Date.now() + cookie.duration)
  const session = await encrypt({ userId, expires })

  const cookieStore = await cookies()

  cookieStore.set(cookie.name, session, { ...cookie.options, expires })

  const cookieHeader = `session=${session}; Path=/; Max-Age=${cookie.duration / 1000}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Strict; Expires=${expires.toUTCString()}`;

  return new Response('Session Created', {
    status: 201,
    headers: {
      'Set-Cookie': cookieHeader,  // Setting the cookie in the header
      'Location': '/app',          // Redirect the user to /app
    },
  });

}

export async function verifySession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(cookie.name)?.value;

  if (!sessionCookie) {
    redirect('/signup');
  }

  const session = await decrypt(sessionCookie);

  if (!session?.userId) {
    redirect('/signup');
  }

  const userId = typeof session.userId === 'number' ? session.userId : Number(session.userId);

  return { userId };
}



export async function deleteCookies() {
  const cookiesStore = await cookies()
  cookiesStore.delete(cookie.name)
  redirect('/signup')
}
