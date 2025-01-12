'use server'
import { prisma } from "../_lib/prisma"
import { createSession } from "../_lib/session"
import bcrypt from 'bcrypt'

export async function signup(_state: unknown, formData: FormData) {
  const name = String(formData.get('name'))
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))

  if (!name || !email || !password) {
    return
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      uname: name,
      email: email,
      password: hashedPassword,
      xp: 0,
      rankId: 1
    },
    select: {
      id: true
    }
  })

  await createSession(user.id)
}
