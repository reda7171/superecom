import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Suspense } from 'react'
import Toaster from '@/components/Toaster';
import WhatsAppButton from '@/components/WhatsAppButton';
import PixelTracker from '@/components/PixelTracker'
import FacebookPixel from '@/components/FacebookPixel'

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Riwaya",
    default: "Riwaya | Librairie en Ligne au Maroc - Livres, Packs & Échange de Livres",
  },
  description: "Découvrez Riwaya, la librairie en ligne n°1 au Maroc. Achetez des livres de développement personnel, business, philosophie et romans. Échangez vos livres avec notre communauté. Livraison rapide partout au Maroc, paiement à la livraison.",
  keywords: [
    // Mots-clés principaux
    "livres maroc", "librairie en ligne maroc", "achat livres maroc", "riwaya",
    // Villes principales
    "librairie casablanca", "librairie rabat", "librairie marrakech", "librairie tanger",
    "livres casablanca", "livres rabat", "acheter livres maroc",
    // Catégories
    "développement personnel maroc", "livres business maroc", "philosophie maroc",
    "romans maroc", "psychologie maroc", "productivité maroc",
    // Services
    "packs de livres", "échange de livres maroc", "livraison livres maroc",
    "paiement à la livraison", "COD maroc", "livraison gratuite livres",
    // Langues
    "livres français maroc", "livres anglais maroc", "livres arabe maroc",
    // Long-tail
    "où acheter des livres au maroc", "meilleure librairie maroc",
    "livres pas cher maroc", "livres occasion maroc"
  ],
  authors: [{ name: "Riwaya Team", url: "https://riwaya.com" }],
  creator: "Riwaya",
  publisher: "Riwaya",
  applicationName: "Riwaya",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Riwaya | Librairie en Ligne au Maroc - Livres & Échange",
    description: "La meilleure sélection de livres au Maroc. Achetez, échangez et découvrez des milliers de livres. Livraison rapide et paiement à la livraison.",
    url: "https://riwaya.com",
    siteName: "Riwaya",
    locale: "fr_MA",
    alternateLocale: ["ar_MA", "en_MA"],
    type: "website",
    images: [
      {
        url: 'https://riwaya.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Riwaya - Librairie en ligne au Maroc',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Riwaya | Livres & Packs au Maroc",
    description: "Découvrez nos collections exclusives de livres. Livraison rapide partout au Maroc.",
    creator: "@riwaya_ma",
    images: ["https://riwaya.com/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  category: 'books',
  verification: {
    google: 'verification_token',
    yandex: 'yandex_verification',
    yahoo: 'yahoo_verification',
  },
  alternates: {
    canonical: 'https://riwaya.com',
    languages: {
      'fr-MA': 'https://riwaya.com/fr',
      'ar-MA': 'https://riwaya.com/ar',
      'en-MA': 'https://riwaya.com/en',
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body
        className={`${outfit.variable} font-sans antialiased bg-white`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Riwaya',
              url: 'https://riwaya.com',
              logo: 'https://riwaya.com/globe.svg',
              sameAs: [
                'https://facebook.com/riwaya',
                'https://instagram.com/riwaya',
                'https://twitter.com/riwaya'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+212-600-000000',
                contactType: 'customer service',
                areaServed: 'MA',
                availableLanguage: ['en', 'fr', 'ar']
              },
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Casablanca',
                addressCountry: 'MA'
              }
            })
          }}
        />
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster />
          <WhatsAppButton />
          <Suspense fallback={null}>
            <PixelTracker />
            <FacebookPixel />
          </Suspense>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
