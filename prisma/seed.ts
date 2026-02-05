import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding...')

  // Nettoyage de la base de données
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.packBook.deleteMany()
  await prisma.pack.deleteMany()
  await prisma.book.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Base de données nettoyée')

  // 1. Création de l'Admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.create({
    data: {
      email: 'admin@riwaya.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('👤 Admin créé (admin@riwaya.com / admin123)')

  // 2. Création des Livres
  const booksData = [
    // Développement Personnel
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      description: 'Un guide facile et éprouvé pour créer de bonnes habitudes et se débarrasser des mauvaises. Ce livre transformera votre façon de voir le progrès et le succès.',
      price: 180,
      stock: 50,
      category: 'Développement Personnel',
      image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Le pouvoir du moment présent',
      author: 'Eckhart Tolle',
      description: 'Ce livre est un guide d\'éveil spirituel qui a inspiré des millions de lecteurs à travers le monde. Apprenez à vivre l\'instant présent.',
      price: 150,
      stock: 30,
      category: 'Développement Personnel',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Les 4 accords Toltèques',
      author: 'Don Miguel Ruiz',
      description: 'Découvrez la voie de la liberté personnelle à travers la sagesse ancestrale des Toltèques. Quatre règles de vie pour transformer votre existence.',
      price: 120,
      stock: 35,
      category: 'Développement Personnel',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Miracle Morning',
      author: 'Hal Elrod',
      description: 'Offrez-vous un supplément de vie ! Découvrez comment une routine matinale peut transformer radicalement votre vie avant 8h du matin.',
      price: 160,
      stock: 25,
      category: 'Développement Personnel',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600',
    },

    // Business & Finance
    {
      title: 'Père Riche, Père Pauvre',
      author: 'Robert Kiyosaki',
      description: 'Ce que les gens riches enseignent à leurs enfants à propos de l\'argent - et que ne font pas les gens pauvres et de la classe moyenne !',
      price: 170,
      stock: 45,
      category: 'Business & Finance',
      image: 'https://images.unsplash.com/photo-1554774853-719586f8c277?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Réfléchissez et devenez riche',
      author: 'Napoleon Hill',
      description: 'Le chef-d\'œuvre de Napoleon Hill. Ce livre vous enseigne comment utiliser le pouvoir de votre esprit pour acquérir la richesse.',
      price: 140,
      stock: 40,
      category: 'Business & Finance',
      image: 'https://images.unsplash.com/photo-1621360841011-cb2aab44c20f?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'La semaine de 4 heures',
      author: 'Tim Ferriss',
      description: 'Travaillez moins, gagnez plus et vivez mieux ! Le livre culte pour les entrepreneurs et ceux qui veulent changer de vie.',
      price: 200,
      stock: 15,
      category: 'Business & Finance',
      image: 'https://images.unsplash.com/photo-1555449918-7b9613583569?auto=format&fit=crop&q=80&w=600',
    },

    // Psychologie
    {
      title: 'L\'intelligence émotionnelle',
      author: 'Daniel Goleman',
      description: 'Pourquoi l\'intelligence émotionnelle peut compter plus que le QI. Apprenez à maîtriser vos émotions pour réussir.',
      price: 190,
      stock: 20,
      category: 'Psychologie',
      image: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Système 1 / Système 2',
      author: 'Daniel Kahneman',
      description: 'Les deux vitesses de la pensée. Une exploration fascinante du fonctionnement de notre esprit par un prix Nobel.',
      price: 220,
      stock: 10,
      category: 'Psychologie',
      image: 'https://images.unsplash.com/photo-1555252554-e69ea2388042?auto=format&fit=crop&q=80&w=600',
    },

    // Fiction & Romans
    {
      title: 'L\'Alchimiste',
      author: 'Paulo Coelho',
      description: 'Un conte philosophique qui a marqué des générations. L\'histoire de Santiago, un jeune berger andalou, à la recherche de sa légende personnelle.',
      price: 130,
      stock: 60,
      category: 'Romans & Fiction',
      image: 'https://images.unsplash.com/photo-1518373714866-3f1479826059?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: '1984',
      author: 'George Orwell',
      description: 'Le chef-d\'œuvre de la dystopie. Big Brother vous regarde dans ce roman saisissant d\'actualité.',
      price: 110,
      stock: 55,
      category: 'Romans & Fiction',
      image: 'https://images.unsplash.com/photo-1531988042232-c555f697be4d?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Le Petit Prince',
      author: 'Antoine de Saint-Exupéry',
      description: 'Le conte poétique et philosophique le plus lu au monde. Une histoire pour les enfants et les grandes personnes.',
      price: 90,
      stock: 70,
      category: 'Romans & Fiction',
      image: 'https://images.unsplash.com/photo-1633477189729-9290b3261d0a?auto=format&fit=crop&q=80&w=600',
    },

    // Religion
    {
      title: 'La vie du Prophète (Sîra)',
      author: 'Tariq Ramadan',
      description: 'Une plongée spirituelle et historique dans la vie du Prophète Muhammad (PSL).',
      price: 240,
      stock: 15,
      category: 'Religion',
      image: 'https://images.unsplash.com/photo-1576766453916-2d6d8ee82780?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Ne sois pas triste',
      author: 'Aaidh ibn Abdullah al-Qarni',
      description: 'Un best-seller mondial qui offre des conseils pratiques pour surmonter les épreuves de la vie avec foi et optimisme.',
      price: 180,
      stock: 40,
      category: 'Religion',
      image: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?auto=format&fit=crop&q=80&w=600',
    },
  ]

  const books = []
  for (const book of booksData) {
    const createdBook = await prisma.book.create({ data: book })
    books.push(createdBook)
    console.log(`📚 Livre créé: ${book.title}`)
  }

  // 3. Création des Packs
  const packsData = [
    {
      name: 'Pack Mindset Ultime',
      description: 'Les indispensables pour forger un mental d\'acier et atteindre vos objectifs. Ce pack combine les meilleures stratégies de productivité et de psychologie.',
      price: 450, // Valeur: 180+150+120 = 450 -> 450 (Pas de réduc ici ? Ajoutons une réduc) -> Mettons 399
      bookIndices: [0, 1, 2], // Atomic Habits, Moment Présent, 4 Accords
      image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Pack Entrepreneur Succès',
      description: 'La boîte à outils complète pour lancer et faire croître votre business. De l\'état d\'esprit à la gestion financière.',
      price: 450, // Valeur: 170+140+200 = 510
      bookIndices: [4, 5, 6], // Père Riche, Réfléchissez, Semaine 4h
      image: 'https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Pack Sagesse & Spiritualité',
      description: 'Retrouvez la paix intérieure et connectez-vous à l\'essentiel avec cette sélection d\'ouvrages profonds.',
      price: 380, // Valeur: 240+180 = 420
      bookIndices: [12, 13], // Sira, Ne sois pas triste
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed051b783c?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Pack Lecture Détente',
      description: 'Évadez-vous avec ces classiques incontournables. Idéal pour les week-ends tranquilles.',
      price: 290, // Valeur: 130+110+90 = 330
      bookIndices: [9, 10, 11], // Alchimiste, 1984, Petit Prince
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
    },
  ]

  for (const packData of packsData) {
    const packBooks = packData.bookIndices.map(index => books[index])

    // Calcul automatique d'un prix attractif si je ne l'ai pas bien mis (mais j'ai mis des prix fixes)
    // Ici j'utilise les prix définis dans packsData

    const pack = await prisma.pack.create({
      data: {
        name: packData.name,
        description: packData.description,
        price: packData.price,
        image: packData.image,
        active: true,
        books: {
          create: packBooks.map(book => ({
            bookId: book.id
          }))
        }
      }
    })
    console.log(`📦 Pack créé: ${pack.name}`)
  }

  console.log('✅ Seeding terminé avec succès !')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
