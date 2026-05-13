import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { isFeatureEnabled, getSetting } from '@/lib/actions/site-settings';
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Toaster from '@/components/Toaster';

const WhatsAppButton = dynamic(() => import('@/components/WhatsAppButton'))
const ChatBot = dynamic(() => import('@/components/ChatBot'))
const PixelTracker = dynamic(() => import('@/components/PixelTracker'))
const FacebookPixel = dynamic(() => import('@/components/FacebookPixel'))
const GoogleAnalytics = dynamic(() => import('@/components/GoogleAnalytics'))
const AdSense = dynamic(() => import('@/components/AdSense'))
const CookieConsent = dynamic(() => import('@/components/CookieConsent'))


const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = await getSetting('site_url') || 'https://riwaya.store';
  const t = await getTranslations({ locale, namespace: 'HomePage.seo' });

  const title = t('Title') || "Riwaya | Librairie en Ligne au Maroc - Livres, Packs & Échange de Livres";
  const description = t('Description') || "Découvrez Riwaya, la librairie en ligne n°1 au Maroc. Achetez des livres de développement personnel, business, philosophie et romans. Échangez vos livres avec notre communauté. Livraison rapide partout au Maroc, paiement à la livraison.";

  const keywordsFr = [
    "livres maroc", "librairie en ligne maroc", "achat livres maroc", "riwaya",
    "librairie casablanca", "librairie rabat", "librairie marrakech", "librairie tanger",
    "développement personnel maroc", "livres business maroc", "philosophie maroc",
    "romans maroc", "packs de livres", "échange de livres maroc", "livraison livres maroc",
    "paiement à la livraison", "COD maroc", "livraison gratuite livres"
  ];

  const keywordsAr = [
    "كتب المغرب", "مكتبة على الانترنت المغرب", "شراء كتب المغرب", "رواية",
    "مكتبة الدار البيضاء", "مكتبة الرباط", "مكتبة مراكش", "مكتبة طنجة",
    "تطوير الذات", "كتب أعمال", "فلسفة", "روايات", "باقات كتب",
    "تبادل الكتب المغرب", "توصيل الكتب", "الدفع عند الاستلام", "توصيل مجاني"
  ];

  const keywords = locale === 'ar' ? keywordsAr : keywordsFr;
  const ogLocale = locale === 'ar' ? 'ar_MA' : locale === 'en' ? 'en_MA' : 'fr_MA';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      template: "%s | Riwaya",
      default: title,
    },
    description: description,
    keywords: keywords,
    authors: [{ name: "Riwaya Team", url: siteUrl }],
    creator: "Riwaya",
    publisher: "Riwaya",
    applicationName: "Riwaya",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: title,
      description: description,
      url: siteUrl,
      siteName: "Riwaya",
      locale: ogLocale,
      alternateLocale: ["fr_MA", "ar_MA", "en_MA"].filter(l => l !== ogLocale),
      type: "website",
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      creator: "@riwaya_ma",
      images: ["/twitter-image.jpg"],
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
  };
}

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
  const isChatBotEnabled = await isFeatureEnabled('feature_chatbot');
  const isWhatsAppEnabled = await isFeatureEnabled('feature_whatsapp');
  const whatsappPhone = await getSetting('contact_whatsapp');
  const instagram = await getSetting('contact_instagram');
  const facebook = await getSetting('contact_facebook');
  const twitter = await getSetting('contact_twitter');
  const linkedin = await getSetting('contact_linkedin');
  const siteUrl = await getSetting('site_url') || 'https://riwaya.store';
  const injectedHeadTags = await getSetting('seo_injected_head_tags');
  const fbPixelId = await getSetting('facebook_pixel_id') || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
  const googleSearchConsoleId = await getSetting('google_search_console_id');
  const googleAnalyticsId = await getSetting('google_analytics_id');
  const adsenseId = await getSetting('adsense_publisher_id');
  const adsenseEnabled = await getSetting('adsense_enabled');

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MSD75KHT');`
          }}
        />
        {/* End Google Tag Manager */}
        <AdSense publisherId={adsenseId || ''} isEnabled={adsenseEnabled === 'true'} />
        {googleSearchConsoleId && (
          <meta name="google-site-verification" content={googleSearchConsoleId} />
        )}
        {injectedHeadTags && (
          <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `</script>${injectedHeadTags}<script>` }} />
        )}
      </head>
      <body
        className={`${outfit.className} font-sans antialiased bg-white`}
        suppressHydrationWarning
      >
        {/* Google Tag Manager (noscript) */}
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MSD75KHT"
          height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe></noscript>
        {/* End Google Tag Manager (noscript) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              url: siteUrl,
              name: 'Riwaya',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${siteUrl}/fr/books?search={search_term_string}`
                },
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Riwaya',
              url: siteUrl,
              logo: `${siteUrl}/globe.svg`,
              sameAs: [
                facebook || 'https://facebook.com/riwaya',
                instagram || 'https://instagram.com/riwaya',
                twitter || 'https://twitter.com/riwaya',
                linkedin || 'https://linkedin.com/company/riwaya'
              ].filter(Boolean),
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: whatsappPhone || '+212-600-000000',
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
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster />
          <CookieConsent />
          {isWhatsAppEnabled && <WhatsAppButton phone={whatsappPhone || undefined} />}
          {isChatBotEnabled && <ChatBot />}
          <Suspense fallback={null}>
            <PixelTracker />
            <FacebookPixel pixelId={fbPixelId} />
            <GoogleAnalytics gaId={googleAnalyticsId || ''} />
          </Suspense>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
