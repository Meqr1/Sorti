'use server'
import { prisma } from "@/app/_lib/prisma"
import bcrypt from 'bcrypt'
import { createSession } from "@/app/_lib/session"

export async function login(_state: unknown, formData: FormData) {
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))

  if (!email || !password) {
    return {
      error: {
        email: "invalid Data",
        password: "invalid Data"
      }
    }
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
    return {
      error: {
        email: "No account using this email"
      }
    }
  }

  const isCorrectPassword = await bcrypt.compare(password, user.password)

  if (!isCorrectPassword) {
    return {
      error: {
        password: "Incorrect password"
      }
    }
  }

  await createSession(user.id)

  return {
    success: true
  }
} 
