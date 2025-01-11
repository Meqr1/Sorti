import instance from "./axios"
import { prisma } from "./prisma"

export async function getUser() {
  const response = await instance.get('/api/auth/verify')
  if (response.status !== 200) {
    return
  }

  const user = await prisma.user.findMany({
    where: {
      id: response.data.id
    }
  })

  return user
}
