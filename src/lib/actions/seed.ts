'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function seedDatabase() {
    try {
        console.log('Start seeding...')
        // ... (rest of the code)

        console.log('Cleaning orderItem...')
        await prisma.orderItem.deleteMany()
        console.log('Cleaning order...')
        await prisma.order.deleteMany()
        console.log('Cleaning packBook...')
        await prisma.packBook.deleteMany()
        console.log('Cleaning pack...')
        await prisma.pack.deleteMany()
        console.log('Cleaning book...')
        await prisma.book.deleteMany()
        console.log('Cleaning user...')
        await prisma.user.deleteMany()

        console.log('Cleaned. Creating admin...')

        // Admin
        const hashedPassword = await bcrypt.hash('admin123', 10)
        await prisma.user.create({
            data: {
                email: 'admin@riwaya.com',
                password: hashedPassword,
                role: 'ADMIN',
            },
        })

        console.log('Admin created. Creating books...')
        // ... (rest of the code)

        // Livres
        const booksData = [
            {
                title: 'Atomic Habits',
                author: 'James Clear',
                description: 'Un guide facile et éprouvé pour créer de bonnes habitudes et se débarrasser des mauvaises.',
                price: 180,
                stock: 50,
                category: 'Développement Personnel',
                image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600',
            },
            {
                title: 'Le pouvoir du moment présent',
                author: 'Eckhart Tolle',
                description: 'Ce livre est un guide d\'éveil spirituel qui a inspiré des millions de lecteurs.',
                price: 150,
                stock: 30,
                category: 'Développement Personnel',
                image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
            },
            {
                title: 'Les 4 accords Toltèques',
                author: 'Don Miguel Ruiz',
                description: 'Découvrez la voie de la liberté personnelle à travers la sagesse ancestrale des Toltèques.',
                price: 120,
                stock: 35,
                category: 'Développement Personnel',
                image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
            },
            {
                title: 'Père Riche, Père Pauvre',
                author: 'Robert Kiyosaki',
                description: 'Ce que les gens riches enseignent à leurs enfants à propos de l\'argent.',
                price: 170,
                stock: 45,
                category: 'Business & Finance',
                image: 'https://images.unsplash.com/photo-1554774853-719586f8c277?auto=format&fit=crop&q=80&w=600',
            },
            {
                title: 'Réfléchissez et devenez riche',
                author: 'Napoleon Hill',
                description: 'Le chef-d\'œuvre de Napoleon Hill sur le succès et la richesse.',
                price: 140,
                stock: 40,
                category: 'Business & Finance',
                image: 'https://images.unsplash.com/photo-1621360841011-cb2aab44c20f?auto=format&fit=crop&q=80&w=600',
            },
            {
                title: 'L\'Alchimiste',
                author: 'Paulo Coelho',
                description: 'Un conte philosophique qui a marqué des générations.',
                price: 130,
                stock: 60,
                category: 'Romans & Fiction',
                image: 'https://images.unsplash.com/photo-1518373714866-3f1479826059?auto=format&fit=crop&q=80&w=600',
            },
            {
                title: '1984',
                author: 'George Orwell',
                description: 'Le chef-d\'œuvre de la dystopie.',
                price: 110,
                stock: 55,
                category: 'Romans & Fiction',
                image: 'https://images.unsplash.com/photo-1531988042232-c555f697be4d?auto=format&fit=crop&q=80&w=600',
            },
        ]

        const createdBooks: any[] = []
        for (const book of booksData) {
            createdBooks.push(await prisma.book.create({ data: book }))
        }

        // Packs
        const packsData = [
            {
                name: 'Pack Mindset Ultime',
                description: 'Les indispensables pour forger un mental d\'acier.',
                price: 399,
                items: [0, 1, 2],
                image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&q=80&w=600',
            },
            {
                name: 'Pack Business Start',
                description: 'Lancez votre entreprise avec les bonnes bases.',
                price: 290,
                items: [3, 4],
                image: 'https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&q=80&w=600',
            }
        ]

        for (const p of packsData) {
            await prisma.pack.create({
                data: {
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    image: p.image,
                    active: true,
                    books: {
                        create: p.items.map(idx => ({
                            bookId: createdBooks[idx].id
                        }))
                    }
                }
            })
        }

        revalidatePath('/')
        return { success: true, message: 'Seeded successfully' }
    } catch (error) {
        console.error('Seed error:', error)
        return { success: false, error: String(error) }
    }
}
