import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const users = [
        {
            name: "Yassine Mansouri",
            email: "yassine.mansouri@riwaya.com",
            city: "Tanger"
        },
        {
            name: "Lina Bakkali",
            email: "lina.bakkali@riwaya.com",
            city: "Marrakech"
        },
        {
            name: "Karim Tazi",
            email: "karim.tazi@riwaya.com",
            city: "Fès"
        }
    ]

    const password = "user123"
    const hashedPassword = await bcrypt.hash(password, 10)

    console.log(`Création de 3 utilisateurs simples...`)

    for (const user of users) {
        try {
            await prisma.user.create({
                data: {
                    email: user.email,
                    password: hashedPassword,
                    role: 'USER',
                    fullName: user.name,
                    city: user.city,
                    credits: 10,
                    rating: 4.5
                },
            })
            console.log(`✅ Utilisateur créé: ${user.name} (${user.email})`)
        } catch (e) {
            if ((e as any).code === 'P2002') {
                console.log(`⚠️ L'email ${user.email} existe déjà.`)
            } else {
                console.error(`Erreur pour ${user.name}:`, e)
            }
        }
    }

    console.log('Mot de passe par défaut pour tous: user123')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
