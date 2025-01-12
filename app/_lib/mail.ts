import 'server-only'
import { jwtVerify, SignJWT } from 'jose';

const key = new TextEncoder().encode(process.env.AUTH_SECRET)

export async function encrypt(body: { name: string, email: string, password: string}) {
  return new SignJWT(body)
    .setProtectedHeader({alg: "HS256"})
    .sign(key)
}

export async function decrypt(url: string) {
  try {
    console.log("DECRYPT URL: ", url)
    const { payload } = await jwtVerify(url, key, {
      algorithms: ['HS256']
    })
    const body = payload
    return body
  } catch {
    return null
  }
}

