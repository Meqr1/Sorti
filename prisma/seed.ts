import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.rank.createMany({
    data: [
      { rankName: 'Iron', minXp: 0, maxXp: 99 },
      { rankName: 'Bronze', minXp: 100, maxXp: 499 },
      { rankName: 'Silver', minXp: 500, maxXp: 999 },
      { rankName: 'Gold', minXp: 1000, maxXp: 4999 },
      { rankName: 'Platinum', minXp: 5000, maxXp: 999999 },
    ],
  })

  console.log('Ranks have been seeded!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

