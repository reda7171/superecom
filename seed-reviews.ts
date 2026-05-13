import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const reviewsData = [
  { fullName: "Amine B.", city: "Casablanca", image: "https://i.pravatar.cc/150?u=amine", rating: 5, comment: "Livraison rapide et livres en très bon état." },
  { fullName: "Sara M.", city: "Rabat", image: "https://i.pravatar.cc/150?u=sara", rating: 5, comment: "Enfin une vraie librairie en ligne au Maroc." },
  { fullName: "Youssef T.", city: "Marrakech", image: "https://i.pravatar.cc/150?u=youssef", rating: 5, comment: "J’ai trouvé des livres introuvables ailleurs." },
  { fullName: "Kenza R.", city: "Tanger", image: "https://i.pravatar.cc/150?u=kenza", rating: 5, comment: "Service client professionnel et réactif." },
  { fullName: "Mehdi L.", city: "Casablanca", image: "https://i.pravatar.cc/150?u=mehdi", rating: 5, comment: "Commande reçue en 24h à Casablanca." },
  { fullName: "Hiba E.", city: "Agadir", image: "https://i.pravatar.cc/150?u=hiba", rating: 5, comment: "Très bonne expérience, je recommande." },
  { fullName: "Omar K.", city: "Fès", image: "https://i.pravatar.cc/150?u=omar", rating: 5, comment: "Large choix de romans et prix corrects." },
  { fullName: "Nawal S.", city: "Meknès", image: "https://i.pravatar.cc/150?u=nawal", rating: 5, comment: "Le meilleur site pour acheter des livres au Maroc." },
  { fullName: "Tariq J.", city: "Oujda", image: "https://i.pravatar.cc/150?u=tariq", rating: 5, comment: "Très satisfait de ma commande sur Riwaya Store. Le site est simple à utiliser et la livraison était rapide. Je recommanderai sûrement." },
  { fullName: "Leila F.", city: "Rabat", image: "https://i.pravatar.cc/150?u=leila", rating: 5, comment: "Je cherchais des livres en anglais au Maroc depuis longtemps. Enfin un site sérieux avec du choix." },
  { fullName: "Othmane A.", city: "Kénitra", image: "https://i.pravatar.cc/150?u=othmane", rating: 5, comment: "Les livres sont arrivés parfaitement emballés. Service professionnel et communication rapide." },
  { fullName: "Salma W.", city: "Casablanca", image: "https://i.pravatar.cc/150?u=salma", rating: 5, comment: "Excellente librairie en ligne marocaine. Beaucoup de catégories et des nouveautés régulièrement." },
  { fullName: "Zineb C.", city: "Tétouan", image: "https://i.pravatar.cc/150?u=zineb", rating: 5, comment: "J’ai commandé plusieurs romans arabes et français, tout est arrivé rapidement. Très bonne qualité de service." }
]

async function seed() {
  console.log('Recherche de livres actifs...')
  // Prendre les 10 premiers livres pour y attacher les avis
  const books = await prisma.book.findMany({
    where: { active: true },
    take: 10
  })

  if (books.length === 0) {
    console.error('Aucun livre trouvé dans la base de données.')
    process.exit(1)
  }

  console.log('Insertion des avis clients...')
  let count = 0

  for (const review of reviewsData) {
    // Choisir un livre aléatoirement parmi les livres récupérés
    const randomBook = books[Math.floor(Math.random() * books.length)]

    // Créer la revue
    await prisma.review.create({
      data: {
        bookId: randomBook.id,
        fullName: review.fullName,
        city: review.city,
        image: review.image,
        rating: review.rating,
        comment: review.comment,
        isApproved: true, // Approuvé directement pour qu'il soit visible
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Date aléatoire dans le dernier mois
      }
    })
    count++
  }

  console.log(`Terminé ! ${count} avis clients ajoutés avec succès.`)
}

seed()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
