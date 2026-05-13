import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'books')
    
    try {
        const files = await fs.readdir(uploadDir)
        const marketingFiles = files.filter(file => 
            file.startsWith('creative_') || 
            file.startsWith('pack_') || 
            file.startsWith('desc_')
        )

        console.log(`Found ${marketingFiles.length} marketing files. Syncing to DB...`)

        for (const file of marketingFiles) {
            let type = 'CREATIVE'
            if (file.startsWith('pack_')) type = 'PACK'
            if (file.startsWith('desc_')) type = 'DESCRIPTION'

            await prisma.marketingAsset.upsert({
                where: { name: file },
                update: {
                    url: `/uploads/books/${file}`,
                    type: type
                },
                create: {
                    name: file,
                    url: `/uploads/books/${file}`,
                    type: type
                }
            })
        }

        console.log('Sync completed successfully.')
    } catch (error) {
        console.error('Error during sync:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
