'use server'
import { prisma } from "../_lib/prisma"
import bcrypt from 'bcrypt'
import { createSession } from "../_lib/session"

export async function login(_state: unknown, formData: FormData) {
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))

  if (!email || !password) {
    return
  }

  const user = await prisma.user.findUnique(
    {
      where: {
        email: email,
      },
      select: {
        id: true,
        email: true,
        password: true
      }
    },
  )

  if (!user) {
    // no user by that email and password
    return 
  }

  const isCorrectPassword = await bcrypt.compare(password, user.password)

  if (!isCorrectPassword) {
    return
  }

  await createSession(user.id)
} 
