import './globals.css'
import { Home, BookOpen } from 'lucide-react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import HeaderWithUser from '@/components/HeaderWithUser'
import FooterWithFeatures from '@/components/FooterWithFeatures'
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

export default async function NotFound() {
  // Charge la locale par défaut car nous sommes en fallback global
  const messages = await getMessages();

  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased bg-white`} suppressHydrationWarning>
        <NextIntlClientProvider locale="fr" messages={messages}>
          <HeaderWithUser />

          <div className="min-h-screen bg-pixio-cream flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pixio-yellow/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>

            <div className="text-center max-w-2xl mx-auto space-y-8 relative z-10">
              <div className="relative inline-block mb-8">
                <h1 className="text-[150px] md:text-[200px] font-black leading-none text-black tracking-tighter drop-shadow-2xl">
                  404<span className="text-pixio-yellow">.</span>
                </h1>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 bg-black text-white px-6 py-2 rounded-full font-black text-sm md:text-base uppercase tracking-widest shadow-xl whitespace-nowrap">
                  Page Introuvable
                </div>
              </div>

              <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-lg mx-auto leading-relaxed">
                Il semble que cette page se soit égarée dans un autre chapitre.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                <a 
                  href="/fr" 
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-black text-white font-black text-sm uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all shadow-xl hover:-translate-y-1"
                >
                  <Home className="w-5 h-5" />
                  <span>Retour à l'accueil</span>
                </a>
                <a 
                  href="/fr/products" 
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-gray-200 text-black font-black text-sm uppercase tracking-widest rounded-full hover:border-black transition-all shadow-sm hover:-translate-y-1"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Voir les livres</span>
                </a>
              </div>
            </div>
          </div>

          <FooterWithFeatures />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
