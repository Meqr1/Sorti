import 'server-only'
import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from './prisma';

const accessToken = new TextEncoder().encode(process.env.AUTH_SECRET)
const refreshToken = new TextEncoder().encode(process.env.REFRESH_SECRET)

const cookie = {
  access: {
    name: 'session',
    options: { httpOnly: true, secure: true, sameSite: true, path: '/' },
    duration: 15 * 60 * 1000
  },
  refresh: {
    name: "refresh",
    options: { httpOnly: true, secure: true, sameSite: true, path: '/' },
    duration: 7 * 24 * 60 * 60 * 1000
  }
}

export async function encrypt(payload: JWTPayload | undefined, isRefreshToken?: boolean) {
  const key = isRefreshToken ? refreshToken : accessToken
  const expiration = isRefreshToken ? '7d' : '15m'

  return new SignJWT(payload)
    .setIssuedAt()
    .setExpirationTime(expiration)
    .setProtectedHeader({ alg: 'HS256' })
    .sign(key)
}

export async function decrypt(session: string, isRefreshToken?: boolean) {
  try {
    const key = isRefreshToken ? refreshToken : accessToken
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256']
    })
    return payload
  } catch {
    return null
  }
}

async function storeRefreshToken(userId: number, token: string, expiresAt: Date) {
  const headersList = await headers()
  const domain = headersList.get('x-forwarded-host') || "";
  const protocol = headersList.get("x-forwarded-proto") || "";

  const refreshURL = `${protocol}://${domain}/api/refresh`;

  const respose = await fetch(refreshURL, {
    method: "POST",
    body: JSON.stringify({
      userId,
      token,
      expiresAt
    })
  })

  return (await respose.json())
}

async function getRefreshToken(token: string) {
  const headersList = await headers();
  const domain = headersList.get('x-forwarded-host') || "";
  const protocol = headersList.get("x-forwarded-proto") || "";

  const refreshURL = `${protocol}://${domain}/api/refresh?refreshToken=${token}`;

  const cookiesStore = await cookies();
  const cookieHeader = cookiesStore.getAll()
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; '); // Format the cookies

  const response = await fetch(refreshURL, {
    headers: {
      'Cookie': cookieHeader // Pass the cookies here
    }
  });

  return (await response.json()).refresh;
}

async function revokeRefreshToken(token: string) {
  await prisma.refreshToken.update({
    where: { token },
    data: { isRevoked: true }
  })

  await prisma.refreshToken.delete({
    where: { 
      token,
      isRevoked: true
    }
  })
}

export async function createSession(userId: number) {
  const accessExpires = new Date(Date.now() + cookie.access.duration)
  const refreshExpires = new Date(Date.now() + cookie.refresh.duration)

  const accessToken = await encrypt({ userId, expires: accessExpires })
  const refreshToken = await encrypt({ userId, expires: refreshExpires }, true)

  await storeRefreshToken(userId, refreshToken, refreshExpires)

  const cookieStore = await cookies()

  cookieStore.set(cookie.access.name, accessToken, { ...cookie.access.options, expires: accessExpires })
  cookieStore.set(cookie.refresh.name, refreshToken, { ...cookie.refresh.options, expires: refreshExpires })

  const accessTokenCookie = `${cookie.access.name}=${accessToken}; Path=/; Max-Age=${cookie.access.duration / 1000}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Strict; Expires=${accessExpires.toUTCString()}`;
  const refreshTokenCookie = `${cookie.refresh.name}=${refreshToken}; Path=/; Max-Age=${cookie.refresh.duration / 1000}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Strict; Expires=${refreshExpires.toUTCString()}`;

  return new Response('Session Created', {
    status: 201,
    headers: {
      'Set-Cookie': accessTokenCookie + ', ' + refreshTokenCookie,
      'Location': '/app',
    },
  });
}

export async function refreshAccessToken() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(cookie.refresh.name)?.value

  console.log('REFREST ACCESS TOKEN::::::::::::::::::::::::::::::::::::::::;')
  console.log(refreshToken)

  if (!refreshToken) {
    redirect('/signup')
  }

  const storedToken = await getRefreshToken(refreshToken)

  if (!refreshToken) {
    await deleteCookies()
    redirect('/signup')
  }

  const decoded = await decrypt(refreshToken, true)
  if (!decoded?.userId || decoded.userId !== storedToken.userId) {
    await revokeRefreshToken(refreshToken)
    await deleteCookies()
    redirect('/signup')
  }

  await createSession(storedToken.userId)

  return { userId: storedToken.userId }
}


export async function verifySession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(cookie.access.name)?.value;

  if (!accessToken) {
    return await refreshAccessToken()
  }

  const session = await decrypt(accessToken);
  if (!session?.userId) {
    return await refreshAccessToken()
  }

  const userId = typeof session.userId === 'number' ? session.userId : Number(session.userId);
  return { userId };
}



export async function deleteCookies() {
  const cookiesStore = await cookies()
  const refreshToken = cookiesStore.get(cookie.refresh.name)?.value

  //if (refreshToken) {
    //await revokeRefreshToken(refreshToken)
  //}

  //cookiesStore.delete(cookie.access.name)
  //cookiesStore.delete(cookie.refresh.name)
  //redirect('/signup')
}
