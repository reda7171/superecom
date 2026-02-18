import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { blogPosts } from './blog-posts'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding complet...')

  // Nettoyage
  console.log('🧹 Nettoyage de la base de données...')

  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.packBook.deleteMany()
  await prisma.pack.deleteMany()
  await prisma.review.deleteMany()
  await prisma.exchange.deleteMany()
  await prisma.exchangeBook.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.book.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.menu.deleteMany()
  await prisma.post.deleteMany()
  await prisma.user.deleteMany()


  console.log('✅ Base de données nettoyée')

  // 1. UTILISATEURS
  console.log('\n👤 Création des utilisateurs...')

  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@riwaya.com',
      password: hashedPassword,
      role: 'ADMIN',
      fullName: 'Admin Riwaya',
      city: 'Casablanca',
      credits: 100,
      rating: 5.0
    },
  })

  // Utilisateurs communauté
  const communityUsersData = [
    { email: 'sara@example.com', fullName: 'Sara Benali', city: 'Casablanca', credits: 30 },
    { email: 'karim@example.com', fullName: 'Karim Idrissi', city: 'Rabat', credits: 20 },
    { email: 'laila@example.com', fullName: 'Laila Amrani', city: 'Marrakech', credits: 15 },
    { email: 'mehdi@example.com', fullName: 'Mehdi Tazi', city: 'Tanger', credits: 25 },
  ]

  const communityUsers = []
  for (const userData of communityUsersData) {
    const hashedPass = await bcrypt.hash('password123', 10)
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPass,
        role: 'USER',
        fullName: userData.fullName,
        city: userData.city,
        credits: userData.credits,
        rating: 4.5
      }
    })
    communityUsers.push(user)
  }
  console.log(`✅ ${1 + communityUsers.length} utilisateurs créés`)

  // 2. LIVRES
  console.log('\n📚 Création des livres...')

  const booksData = [
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      description: 'Un guide facile et éprouvé pour créer de bonnes habitudes et se débarrasser des mauvaises.',
      price: 180,
      stock: 50,
      category: 'Développement Personnel',
      image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600',
      language: 'en'
    },
    {
      title: 'Le pouvoir du moment présent',
      author: 'Eckhart Tolle',
      description: 'Ce livre est un guide d\'éveil spirituel qui a inspiré des millions de lecteurs.',
      price: 150,
      stock: 30,
      category: 'Développement Personnel',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
      language: 'fr'
    },
    {
      title: 'Les 4 accords Toltèques',
      author: 'Don Miguel Ruiz',
      description: 'Découvrez la voie de la liberté personnelle à travers la sagesse ancestrale des Toltèques.',
      price: 120,
      stock: 35,
      category: 'Développement Personnel',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
      language: 'fr'
    },
    {
      title: 'Miracle Morning',
      author: 'Hal Elrod',
      description: 'Découvrez comment une routine matinale peut transformer radicalement votre vie.',
      price: 160,
      stock: 25,
      category: 'Développement Personnel',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600',
      language: 'fr'
    },
    {
      title: 'Père Riche, Père Pauvre',
      author: 'Robert Kiyosaki',
      description: 'Ce que les gens riches enseignent à leurs enfants à propos de l\'argent.',
      price: 170,
      stock: 45,
      category: 'Business & Finance',
      image: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&q=80&w=600',
      language: 'fr'
    },
    {
      title: 'Think and Grow Rich',
      author: 'Napoleon Hill',
      description: 'The masterpiece by Napoleon Hill.',
      price: 140,
      stock: 40,
      category: 'Business & Finance',
      image: 'https://images.unsplash.com/photo-1621360841011-cb2aab44c20f?auto=format&fit=crop&q=80&w=600',
      language: 'en'
    },
    {
      title: 'La semaine de 4 heures',
      author: 'Tim Ferriss',
      description: 'Travaillez moins, gagnez plus et vivez mieux !',
      price: 200,
      stock: 15,
      category: 'Business & Finance',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
      language: 'fr'
    },
    {
      title: 'L\'Alchimiste',
      author: 'Paulo Coelho',
      description: 'Un conte philosophique qui a marqué des générations.',
      price: 130,
      stock: 100,
      category: 'Romans & Fiction',
      image: 'https://images.unsplash.com/photo-1633477189729-9290b3261d0a?auto=format&fit=crop&q=80&w=800',
      language: 'fr'
    },
    {
      title: 'قواعد العشق الأربعون',
      author: 'إليف شافاق',
      description: 'رواية عن جلال الدين الرومي وشمس التبريزي، تستعرض قواعد العشق والحياة.',
      price: 140,
      stock: 45,
      category: 'Romans & Fiction',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
      language: 'ar'
    },
    {
      title: 'النبي',
      author: 'جبران خليل جبران',
      description: 'كتاب فلسفي يضم مقالات شعرية تتناول مواضيع الحياة المختلفة بلسان المصطفى.',
      price: 110,
      stock: 40,
      category: 'Philosophie',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
      language: 'ar'
    },
    {
      title: 'قوة عقلك الباطن',
      author: 'جوزيف ميرفي',
      description: 'كيفية استخدام عقلك الباطن لتحقيق النجاح والسعادة في حياتك.',
      price: 160,
      stock: 35,
      category: 'Développement Personnel',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
      language: 'ar'
    },
    {
      title: 'موسم الهجرة إلى الشمال',
      author: 'الطيب صالح',
      description: 'إحدى أهم الروايات في الأدب العربي المعاصر، تتناول صدام الحضارات.',
      price: 125,
      stock: 20,
      category: 'Romans & Fiction',
      image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600',
      language: 'ar'
    },
    {
      title: '48 قانوناً للقوة',
      author: 'روبرت غرين',
      description: 'كتاب يستعرض قوانين القوة وتاريخ النفوذ وكيفية التعامل مع الصراعات البشرية.',
      price: 210,
      stock: 25,
      category: 'Business & Finance',
      image: 'https://images.unsplash.com/photo-1621360841011-cb2aab44c20f?auto=format&fit=crop&q=80&w=600',
      language: 'ar'
    },
    {
      title: 'The Psychology of Money',
      author: 'Morgan Housel',
      description: 'Timeless lessons on wealth, greed, and happiness doing well with money.',
      price: 195,
      stock: 40,
      category: 'Business & Finance',
      image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600',
      language: 'en'
    },
    {
      title: 'The Subtle Art of Not Giving a F*ck',
      author: 'Mark Manson',
      description: 'A counterintuitive approach to living a good life.',
      price: 175,
      stock: 35,
      category: 'Développement Personnel',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
      language: 'en'
    },
    {
      title: 'Deep Work',
      author: 'Cal Newport',
      description: 'Rules for focused success in a distracted world.',
      price: 185,
      stock: 28,
      category: 'Productivité',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
      language: 'en'
    },
    {
      title: 'Zero to One',
      author: 'Peter Thiel',
      description: 'Notes on Startups, or How to Build the Future.',
      price: 220,
      stock: 20,
      category: 'Business & Finance',
      image: 'https://images.unsplash.com/photo-1621360841011-cb2aab44c20f?auto=format&fit=crop&q=80&w=600',
      language: 'en'
    },
    {
      title: 'The 5 AM Club',
      author: 'Robin Sharma',
      description: 'Own your morning. Elevate your life.',
      price: 165,
      stock: 45,
      category: 'Développement Personnel',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600',
      language: 'en'
    },
  ]

  const books = []
  for (const book of booksData) {
    const createdBook = await prisma.book.create({ data: book })
    books.push(createdBook)
  }
  console.log(`✅ ${books.length} livres créés`)

  // 3. PACKS
  console.log('\n📦 Création des packs...')

  const pack1 = await prisma.pack.create({
    data: {
      name: 'Pack Mindset Ultime',
      description: 'Les indispensables pour forger un mental d\'acier.',
      price: 399,
      image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&q=80&w=600',
      active: true,
      books: {
        create: [
          { bookId: books[0].id },
          { bookId: books[1].id },
          { bookId: books[2].id }
        ]
      }
    }
  })

  const pack2 = await prisma.pack.create({
    data: {
      name: 'Pack Entrepreneur Succès',
      description: 'La boîte à outils complète pour lancer votre business.',
      price: 450,
      image: 'https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&q=80&w=600',
      active: true,
      books: {
        create: [
          { bookId: books[4].id },
          { bookId: books[5].id },
          { bookId: books[6].id }
        ]
      }
    }
  })
  console.log('✅ 2 packs créés')

  // 4. COMMANDES
  console.log('\n💰 Création des commandes...')

  await prisma.order.create({
    data: {
      fullName: 'Mohammed Alami',
      phone: '+212612345678',
      address: '15 Rue Hassan II',
      city: 'Casablanca',
      total: 180 * 3 + 170 * 2,
      status: 'DELIVERED',
      items: {
        create: [
          { type: 'BOOK', bookId: books[0].id, quantity: 3, price: 180 * 3 },
          { type: 'BOOK', bookId: books[4].id, quantity: 2, price: 170 * 2 }
        ]
      }
    }
  })

  await prisma.order.create({
    data: {
      fullName: 'Fatima Zahra',
      phone: '+212623456789',
      address: '22 Avenue Mohammed V',
      city: 'Rabat',
      total: 180 * 2 + 150,
      status: 'DELIVERED',
      items: {
        create: [
          { type: 'BOOK', bookId: books[0].id, quantity: 2, price: 180 * 2 },
          { type: 'BOOK', bookId: books[1].id, quantity: 1, price: 150 }
        ]
      }
    }
  })

  await prisma.order.create({
    data: {
      fullName: 'Youssef El Fassi',
      phone: '+212634567890',
      address: '8 Rue de Fès',
      city: 'Marrakech',
      total: 170 * 4 + 200,
      status: 'DELIVERED',
      items: {
        create: [
          { type: 'BOOK', bookId: books[4].id, quantity: 4, price: 170 * 4 },
          { type: 'BOOK', bookId: books[6].id, quantity: 1, price: 200 }
        ]
      }
    }
  })
  console.log('✅ 3 commandes créées')

  // 5. LIVRES D'ÉCHANGE
  console.log('\n🔄 Création des livres d\'échange...')

  await prisma.exchangeBook.create({
    data: {
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      condition: 'GOOD',
      exchangeType: 'DIRECT',
      ownerId: communityUsers[0].id,
      status: 'AVAILABLE',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400'
    }
  })

  await prisma.exchangeBook.create({
    data: {
      title: 'Homo Deus',
      author: 'Yuval Noah Harari',
      condition: 'NEW',
      exchangeType: 'GIVEAWAY',
      ownerId: communityUsers[1].id,
      status: 'AVAILABLE',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400'
    }
  })
  console.log('✅ 2 livres d\'échange créés')

  // 6. AVIS
  console.log('\n⭐ Création des avis...')

  const reviews = [
    {
      bookId: books[0].id,
      fullName: 'Ahmed Bennani',
      rating: 5,
      comment: 'Excellent livre ! M\'a vraiment aidé à changer mes habitudes.',
      isApproved: true
    },
    {
      bookId: books[0].id,
      fullName: 'Zineb Alami',
      rating: 5,
      comment: 'Très inspirant et pratique. Je le recommande vivement.',
      isApproved: true
    },
    {
      bookId: books[4].id,
      fullName: 'Fatima Zahra',
      rating: 5,
      comment: 'Un classique indispensable pour comprendre l\'argent !',
      isApproved: true
    },
    {
      bookId: books[8].id, // قواعد العشق الأربعون
      fullName: 'Yassine Mansouri',
      rating: 5,
      comment: 'رواية رائعة جداً، تأخذك في رحلة روحية لا تنسى.',
      isApproved: true
    },
    {
      bookId: books[10].id, // قوة عقلك الباطن
      fullName: 'Laila Tazi',
      rating: 4,
      comment: 'كتاب مفيد جداً لتغيير طريقة التفكير السلبية.',
      isApproved: true
    },
    {
      bookId: books[13].id, // The Psychology of Money
      fullName: 'John Smith',
      rating: 5,
      comment: 'Best book on finance I have ever read. Simple and profound.',
      isApproved: true
    },
    {
      bookId: books[14].id, // The Subtle Art
      fullName: 'Sarah Wilson',
      rating: 4,
      comment: 'Refreshingly honest and funny. A great perspective on life.',
      isApproved: true
    },
    {
      bookId: books[7].id, // L'Alchimiste
      fullName: 'Marc Dubois',
      rating: 5,
      comment: 'Un chef-d\'œuvre absolu. À lire au moins une fois dans sa vie.',
      isApproved: true
    }
  ]

  for (const review of reviews) {
    await prisma.review.create({ data: review })
  }
  console.log(`✅ ${reviews.length} avis créés`)

  // 7. COUPONS
  console.log('\n🎟️ Création des coupons...')

  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      discount: 10,
      type: 'PERCENTAGE',
      isActive: true,
      expiresAt: new Date('2026-12-31')
    }
  })

  await prisma.coupon.create({
    data: {
      code: 'SUMMER50',
      discount: 50,
      type: 'FIXED_AMOUNT',
      isActive: true,
      expiresAt: new Date('2026-08-31')
    }
  })
  console.log('✅ 2 coupons créés')

  // 8. MENUS
  console.log('\n🍔 Création des menus...')

  const headerMenu = await prisma.menu.create({
    data: {
      slug: 'header',
      name: 'Menu Principal',
      isActive: true,
      items: {
        create: [
          { label: 'LIVRES', url: '/books', order: 0, isActive: true },
          { label: 'PACKS', url: '/packs', order: 1, isActive: true },
          { label: 'ECHANGES', url: '/community/market', order: 2, isActive: true },
          { label: 'JOURNAL', url: '/blog', order: 3, isActive: true },
          { label: 'ACCUEIL', url: '/', order: 4, isActive: true },
        ]
      }
    }
  })

  const footerMenu = await prisma.menu.create({
    data: {
      slug: 'footer-main',
      name: 'Pied de page - Principal',
      isActive: true,
      items: {
        create: [
          { label: 'À propos', url: '/about', order: 0, isActive: true },
          { label: 'Contact', url: '/contact', order: 1, isActive: true },
          { label: 'FAQ', url: '/faq', order: 2, isActive: true },
        ]
      }
    }
  })

  console.log('✅ 2 menus créés')

  // 9. ARTICLES DE BLOG
  console.log('\n📝 Création des articles de blog...')

  for (const post of blogPosts) {
    await prisma.post.create({
      data: {
        ...post,
        authorId: admin.id
      }
    })
  }
  console.log(`✅ ${blogPosts.length} articles de blog créés`)

  console.log('\n🎉 Seeding terminé avec succès !')
  console.log('\n📊 Résumé:')
  console.log(`   - ${books.length} livres`)
  console.log('   - 2 packs')
  console.log('   - 3 commandes')
  console.log(`   - ${1 + communityUsers.length} utilisateurs`)
  console.log('   - 2 livres d\'échange')
  console.log('   - 3 avis')
  console.log('   - 2 coupons')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
