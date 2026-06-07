import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Initializing displayOrder for all products...')
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  })

  for (let i = 0; i < products.length; i++) {
    await prisma.product.update({
      where: { id: products[i].id },
      data: { displayOrder: i }
    })
  }
  console.log(`Done! ${products.length} products updated.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
