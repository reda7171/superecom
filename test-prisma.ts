
import { prisma } from './src/lib/prisma'

async function main() {
    console.log('Models available in prisma:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')))
    try {
        const count = await (prisma as any).review.count()
        console.log('Review count:', count)
    } catch (e: any) {
        console.error('Error accessing review:', e.message)
    }
}

main()
