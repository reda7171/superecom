import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Toaster from '@/components/Toaster';

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
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
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
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
