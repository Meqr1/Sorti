import { prisma } from "../_lib/prisma"
import { verifySession } from "../_lib/session"

export const getUser = async () => {
  const session = await verifySession()

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId
    },
    select: {
      email: true,
      id: true,
      xp: true,
      rankId: true,
    }
  })

  return user
}
