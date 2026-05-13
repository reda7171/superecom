import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Download, FileText, CheckCircle2, Shield, ArrowRight, BookOpen, Star } from 'lucide-react'
import HeaderWithUser from '@/components/HeaderWithUser'
import Footer from '@/components/FooterWithFeatures'
import { Link } from '@/i18n/routing'
import { normalizeImage } from '@/lib/utils'
import DigitalAddToCartButton from '@/components/DigitalAddToCartButton'

import { getCommunityUser } from '@/lib/actions/community-auth'

export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { id } = await params
  const product = await prisma.digitalProduct.findUnique({ where: { id } })
  if (!product) return { title: 'Livre non trouvé' }

  return {
    title: `${product.title} | Riwaya`,
    description: product.description,
  }
}

export default async function DigitalProductPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params
  const t = await getTranslations('DigitalBooks')
  
  const product = await prisma.digitalProduct.findUnique({
    where: { id, active: true }
  })

  if (!product) notFound()

  const user = await getCommunityUser()
  let hasPurchased = false

  if (user && user.email) {
    const purchased = await prisma.orderItem.findFirst({
      where: {
        digitalProductId: product.id,
        order: {
          email: user.email,
          status: {
            in: ['CONFIRMED', 'DELIVERED', 'SHIPPED']
          }
        }
      }
    })
    hasPurchased = !!purchased
  }

  // On peut ajouter une logique pour ajouter au panier
  // Mais pour l'instant on garde une structure simple
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  return (
    <>
      <HeaderWithUser />
      
      <main className="min-h-screen bg-white pt-32 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 font-medium">
            <Link href="/" className="hover:text-amber-600 transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/livres-numeriques" className="hover:text-amber-600 transition-colors">Livres Numériques (PDF)</Link>
            <span>/</span>
            <span className="text-gray-900 truncate max-w-[200px]">{product.title}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-16">
            
            {/* Image (gauche) */}
            <div className="lg:w-1/3">
              <div className="sticky top-32">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-gray-100 group">
                  <img
                    src={normalizeImage(product.image)}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Badge PDF Overlay */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-full border border-white/10">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">E-Book PDF</span>
                  </div>
                  {discount && discount > 0 && (
                    <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 bg-amber-400 text-black font-black text-sm rounded-full rotate-12 shadow-lg">
                      -{discount}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contenu (droite) */}
            <div className="lg:w-2/3 space-y-10">
              
              {/* Header produit */}
              <div className="space-y-4">
                {product.category && (
                  <div className="inline-flex items-center px-3 py-1 bg-amber-50 text-amber-600 text-xs font-black uppercase tracking-widest rounded-full">
                    {product.category}
                  </div>
                )}
                
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                  {product.title}
                </h1>
                
                <p className="text-xl text-gray-500 italic font-medium">
                  par <span className="text-gray-900 not-italic font-bold">{product.author}</span>
                </p>
              </div>

              {/* Méta infos */}
              <div className="flex flex-wrap items-center gap-6 py-6 border-y border-gray-100">
                {product.pages && (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <BookOpen className="w-5 h-5 text-gray-400" />
                    <span>{product.pages} pages</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span>Format PDF Universel</span>
                </div>
                {product.fileSize && (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Download className="w-5 h-5 text-gray-400" />
                    <span>{product.fileSize}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Star className="w-5 h-5 text-gray-400" />
                  <span>Livraison Immédiate</span>
                </div>
              </div>

              {/* Prix et CTA */}
              <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 space-y-6">
                <div className="flex items-end gap-4">
                  <span className="text-4xl font-black text-gray-900">{product.price} MAD</span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-400 line-through mb-1">{product.originalPrice} MAD</span>
                  )}
                </div>

                <div className="space-y-3">
                  {hasPurchased ? (
                    <Link 
                      href={`/${locale}/livres-numeriques/reader/${product.id}`}
                      className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-500 text-black font-black uppercase tracking-widest rounded-xl transition-all text-center"
                    >
                      <BookOpen className="w-5 h-5" />
                      Lire maintenant
                    </Link>
                  ) : (
                    <DigitalAddToCartButton product={{
                      id: product.id,
                      title: product.title,
                      price: product.price,
                      image: product.image
                    }} />
                  )}
                  <p className="text-center text-xs text-gray-500 font-medium">
                    <Shield className="w-3 h-3 inline-block mr-1 text-green-500" />
                    Paiement sécurisé. Le lien PDF vous sera envoyé par email.
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-gray-900">À propos de ce livre</h2>
                <div className="prose prose-lg text-gray-600 leading-relaxed">
                  <p className="whitespace-pre-line">{product.description}</p>
                </div>
              </div>

              {/* Avantages */}
              <div className="bg-amber-50/50 rounded-3xl p-8 border border-amber-100">
                <h3 className="text-lg font-black text-gray-900 mb-6">Pourquoi choisir le format numérique ?</h3>
                <ul className="space-y-4">
                  {[
                    "Lecture instantanée après confirmation du paiement",
                    "Compatible avec tous vos appareils (PC, Mac, Smartphone, Tablette)",
                    "Possibilité d'annoter et surligner le PDF",
                    "Plus léger et écologique qu'un livre papier",
                    "Accès à vie à votre fichier"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  )
}
