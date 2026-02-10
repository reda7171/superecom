import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const adminName = "Mohamed Amine Bentaja"
    const email = "mohamed.amine.bentaja@riwaya.com"
    const password = "admin123"

    console.log(`Création de l'admin ${adminName}...`)

    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                role: 'ADMIN',
                fullName: adminName,
                // Champs optionnels qui peuvent être utiles pour le profil
                city: 'Casablanca',
                credits: 100,
                rating: 5.0
            },
        })
        console.log('✅ Admin créé avec succès')
        console.log(`Email: ${email}`)
        console.log(`Password: ${password}`)
    } catch (e) {
        if ((e as any).code === 'P2002') {
            console.log('⚠️ Cet email existe déjà.')
        } else {
            console.error(e)
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
