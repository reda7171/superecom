import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getPopularBooks } from '@/lib/db/products'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { CheckCircle2, Truck, Shield, Star, BookOpen } from 'lucide-react'
import { Link } from '@/i18n/routing'

const seoPages: Record<string, any> = {
  'livre-maroc': {
    title: 'Livre Maroc | Acheter des livres en ligne au Maroc – SuperEcom Store',
    description: 'Achetez vos livres au Maroc avec SuperEcom Store. Large choix de livres, livraison rapide à domicile et paiement à la livraison (COD) partout au Maroc.',
    h1: 'Livre Maroc : Votre librairie en ligne de référence',
    keyword: 'livre maroc',
    intro: "Bienvenue sur SuperEcom Store, votre destination numéro 1 pour l'achat de livres au Maroc. Que vous soyez à Casablanca, Rabat, Marrakech, Tanger ou n'importe où dans le royaume, nous vous livrons vos ouvrages préférés directement à votre porte.",
    categoryText: "Nous proposons une vaste sélection couvrant tous les genres : développement personnel, business, littérature classique, romans contemporains et bien plus.",
    faq: [
      { q: "Comment commander un livre au Maroc ?", a: "C'est simple ! Parcourez notre catalogue, ajoutez le livre à votre panier, renseignez votre adresse et choisissez le paiement à la livraison. Nous expédions votre commande sous 24h." },
      { q: "Quels sont les frais de livraison ?", a: "Les frais de livraison sont standardisés pour toutes les villes du Maroc. De plus, nous offrons régulièrement la livraison gratuite pour les commandes dépassant un certain montant." }
    ]
  },
  'product-maroc': {
    title: 'Product Maroc | Buy Products Online in Morocco – SuperEcom Store',
    description: 'Looking for a product in Morocco? SuperEcom Store offers a great selection of English, French and Arabic products with nationwide delivery and Cash on Delivery.',
    h1: 'Product Maroc : The Best Place to Buy Products in Morocco',
    keyword: 'product maroc',
    intro: "Finding the right product in Morocco has never been easier. At SuperEcom Store, we provide a premium selection of English, French, and Arabic products, delivered straight to your home anywhere in Morocco.",
    categoryText: "Discover our curated collections including Self-Help, Business & Finance, Philosophy, and bestselling novels.",
    faq: [
      { q: "Do you deliver English products in Morocco?", a: "Yes, we have a dedicated selection of the best English products and deliver them across all Moroccan cities." },
      { q: "Can I pay Cash on Delivery?", a: "Absolutely! We support Cash on Delivery (COD) for all orders to ensure a safe and trustworthy shopping experience." }
    ]
  },
  'acheter-livre-au-maroc': {
    title: 'Acheter Livre au Maroc | Livraison Rapide & Paiement à la Réception',
    description: 'Où acheter un livre au Maroc ? SuperEcom Store est la meilleure librairie en ligne pour commander vos livres en toute simplicité. Paiement à la livraison.',
    h1: 'Acheter un Livre au Maroc : Simple, Rapide et Sécurisé',
    keyword: 'acheter livre au maroc',
    intro: "Si vous cherchez à acheter un livre au Maroc sans vous déplacer, vous êtes au bon endroit. SuperEcom simplifie votre expérience de lecture en vous proposant un catalogue riche et varié accessible en quelques clics.",
    categoryText: "Profitez de nos offres exclusives et de nos packs de livres à prix réduit pour enrichir votre bibliothèque.",
    faq: [
      { q: "Pourquoi acheter sur SuperEcom.store ?", a: "Nous garantissons des livres de qualité, un service client réactif, et une livraison express partout au Maroc avec option de paiement à la réception." },
      { q: "Puis-je retourner un livre ?", a: "Oui, nous avons une politique de retour flexible si le livre reçu est endommagé ou non conforme à votre commande." }
    ]
  },
  'librairie-en-ligne-maroc': {
    title: 'Librairie en Ligne Maroc | SuperEcom Store',
    description: 'La meilleure librairie en ligne au Maroc. Achat de livres, romans, et développement personnel avec livraison à domicile. Découvrez notre catalogue.',
    h1: 'SuperEcom : La Librairie en Ligne N°1 au Maroc',
    keyword: 'librairie en ligne maroc',
    intro: "Oubliez les déplacements et les files d'attente. SuperEcom est votre librairie en ligne au Maroc ouverte 24h/24 et 7j/7. Nous mettons la culture et le savoir à portée de main.",
    categoryText: "Notre librairie virtuelle propose des milliers de références constamment mises à jour avec les dernières nouveautés mondiales.",
    faq: [
      { q: "Livrez-vous dans toutes les villes ?", a: "Oui, notre librairie en ligne dessert Casablanca, Rabat, Fès, Tanger, Agadir, et toutes les autres villes marocaines." },
      { q: "Proposez-vous des livres d'occasion ?", a: "En plus des livres neufs, nous disposons d'une plateforme communautaire (Market) permettant l'échange de livres d'occasion entre lecteurs." }
    ]
  },
  'roman-maroc': {
    title: 'Roman Maroc | Acheter les meilleurs romans au Maroc – SuperEcom',
    description: 'Passionné de lecture ? Découvrez notre collection de romans au Maroc. Romans policiers, romance, fantastique et littérature classique. Livraison rapide.',
    h1: 'Roman Maroc : Plongez dans des histoires captivantes',
    keyword: 'roman maroc',
    intro: "Pour les passionnés d'évasion, notre sélection de romans au Maroc saura vous séduire. Des best-sellers internationaux aux chefs-d'œuvre de la littérature, trouvez votre prochaine grande aventure littéraire.",
    categoryText: "Nous couvrons tous les genres : policier, thriller, romance, fantastique, et littérature contemporaine arabe et francophone.",
    faq: [
      { q: "Avez-vous les derniers romans à succès ?", a: "Oui, nous mettons régulièrement à jour notre catalogue avec les romans les plus populaires du moment." },
      { q: "Comment trouver un roman spécifique ?", a: "Utilisez notre barre de recherche optimisée ou naviguez à travers nos catégories littéraires." }
    ]
  },
  'livres-francais-maroc': {
    title: 'Livres Français Maroc | Littérature & Développement Personnel',
    description: 'Trouvez et achetez vos livres en français au Maroc sur SuperEcom Store. Un grand choix de livres francophones avec paiement à la livraison.',
    h1: 'Livres Français au Maroc : Votre sélection francophone',
    keyword: 'livres français maroc',
    intro: "La lecture en langue française est profondément ancrée dans la culture marocaine. SuperEcom Store vous propose la meilleure sélection de livres en français au Maroc.",
    categoryText: "Découvrez des auteurs français incontournables et des traductions des plus grands succès mondiaux en développement personnel et business.",
    faq: [
      { q: "Quelles catégories de livres français proposez-vous ?", a: "Nous avons des romans, des essais philosophiques, des livres de psychologie et de nombreuses œuvres de développement personnel en français." }
    ]
  },
  'livres-anglais-maroc': {
    title: 'English Products Morocco | Livres Anglais au Maroc – SuperEcom',
    description: 'Looking for English products in Morocco? Acheter des livres en anglais au Maroc facilement avec SuperEcom Store. Best sellers, Self-help & Novels.',
    h1: 'English Products Morocco : Livres Anglais au Maroc',
    keyword: 'livres anglais maroc',
    intro: "Avec l'essor de la langue de Shakespeare, la demande pour des livres en anglais au Maroc est grandissante. SuperEcom Store est fier de proposer une sélection pointue d'ouvrages en version originale.",
    categoryText: "Improve your English while reading the world's bestsellers in Self-improvement, Business, and Fiction.",
    faq: [
      { q: "Are these original English products?", a: "We offer high-quality editions of the most sought-after English products globally." },
      { q: "Do you deliver to student campuses?", a: "Yes, we deliver anywhere in Morocco, including universities and student accommodations." }
    ]
  }
}

export async function generateMetadata({ params }: { params: Promise<{ seoSlug: string }> }): Promise<Metadata> {
  const { seoSlug } = await params
  const data = seoPages[seoSlug]

  if (!data) return {}

  return {
    title: data.title,
    description: data.description,
    keywords: [data.keyword, 'maroc', 'livres', 'librairie', 'acheter livre'],
    openGraph: {
      title: data.title,
      description: data.description,
      type: 'website',
    }
  }
}

export default async function SeoLandingPage({ params }: { params: Promise<{ seoSlug: string, locale: string }> }) {
  const { seoSlug, locale } = await params
  const data = seoPages[seoSlug]

  if (!data) {
    notFound()
  }

  // Fetch some popular products to show at the bottom
  const popularBooks = await getPopularBooks(4)

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-black text-white pt-24 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-500 via-black to-black"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-widest uppercase mb-6">
            <BookOpen className="w-4 h-4 text-pixio-yellow" />
            <span>Spécialité SuperEcom</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
            {data.h1}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-medium">
            {data.intro}
          </p>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16">
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 text-black" />
            <span className="font-bold text-sm uppercase tracking-wider">Livraison Partout au Maroc</span>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-black" />
            <span className="font-bold text-sm uppercase tracking-wider">Paiement à la Livraison</span>
          </div>
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-black" />
            <span className="font-bold text-sm uppercase tracking-wider">Qualité Garantie</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <article className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-black prose-p:text-gray-600 mb-16 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
          <h2>Pourquoi choisir SuperEcom pour vos lectures ?</h2>
          <p>{data.categoryText}</p>
          <p>Notre mission est de démocratiser l'accès à la culture. En choisissant <strong>{data.keyword}</strong> via notre plateforme, vous bénéficiez d'une interface intuitive, d'un service client à l'écoute et de recommandations personnalisées.</p>
          
          <h3>Notre sélection de catégories :</h3>
          <ul>
            <li><strong>Développement Personnel :</strong> Devenez la meilleure version de vous-même.</li>
            <li><strong>Business & Finance :</strong> Apprenez des plus grands entrepreneurs.</li>
            <li><strong>Romans & Fictions :</strong> Évadez-vous à travers des histoires captivantes.</li>
            <li><strong>Packs Économiques :</strong> Des sélections thématiques pour lire plus en dépensant moins.</li>
          </ul>

          <div className="bg-pixio-cream p-6 rounded-2xl mt-10 border border-yellow-100">
            <h3 className="mt-0 text-black">Moyens de paiement et Livraison</h3>
            <p className="mb-0 text-gray-700">Acheter en ligne n'a jamais été aussi sûr. Nous avons choisi le <strong>Paiement à la Livraison (Cash on Delivery)</strong> pour vous garantir une tranquillité d'esprit absolue. Payez uniquement lorsque vous recevez votre commande entre vos mains. Nous couvrons l'ensemble des villes marocaines avec des prestataires de livraison fiables et rapides.</p>
          </div>
        </article>

        {/* FAQ Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-black text-black mb-8 text-center">Foire Aux Questions</h2>
          <div className="space-y-4">
            {data.faq.map((item: any, idx: number) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-black mb-2 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-pixio-yellow shrink-0 mt-0.5" />
                  {item.q}
                </h3>
                <p className="text-gray-600 pl-8">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Products */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-black">Nos Meilleures Ventes</h2>
            <Link href="/products" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
              Voir tout le catalogue &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {popularBooks.map((product: any) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </section>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": data.faq.map((item: any) => ({
              "@type": "Question",
              "name": item.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.a
              }
            }))
          })
        }}
      />

      <Footer />
    </div>
  )
}
