import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Toaster from '@/components/Toaster';
import InstallPrompt from '@/components/InstallPrompt';
import WhatsAppButton from '@/components/WhatsAppButton';

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Riwaya",
    default: "Riwaya | Digital Literature Curators & Book Bundles",
  },
  description: "Explore our hand-picked collection of masterpieces in personal growth, business, and philosophy. Quality books and curated bundles delivered across Morocco.",
  keywords: ["livres", "books", "Morocco", "Maroc", "personal growth", "business books", "philosophy", "book bundles", "packs de livres", "Riwaya"],
  authors: [{ name: "Riwaya Team" }],
  openGraph: {
    title: "Riwaya | Digital Literature Curators",
    description: "Explore our hand-picked collection of masterpieces in personal growth, business, and philosophy.",
    url: "https://riwaya.com",
    siteName: "Riwaya",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Riwaya | Digital Literature Curators",
    description: "Hand-picked books and bundles for the modern mind.",
  },
  alternates: {
    canonical: 'https://riwaya.com',
    languages: {
      'fr-MA': 'https://riwaya.com/fr',
      'ar-MA': 'https://riwaya.com/ar',
      'en-MA': 'https://riwaya.com/en',
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Riwaya',
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
          <InstallPrompt />
          <WhatsAppButton />
        </NextIntlClientProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
