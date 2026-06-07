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
import Script from 'next/script';

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
  const siteUrl = await getSetting('site_url') || 'https://superEcom.store';
  
  // Dynamic SEO configurations from database
  const seoTitle = await getSetting('seo_default_title');
  const seoDescription = await getSetting('seo_default_description');
  const seoKeywords = await getSetting('seo_default_keywords');
  const seoAuthor = await getSetting('seo_author') || 'SuperEcom Team';
  const seoOgImage = await getSetting('seo_og_image') || '/og-image.jpg';
  const seoOgWidth = await getSetting('seo_og_image_width') || '1200';
  const seoOgHeight = await getSetting('seo_og_image_height') || '630';
  const seoOgAlt = await getSetting('seo_og_image_alt');
  const seoOgType = await getSetting('seo_og_type') || 'website';
  const seoTwitterHandle = await getSetting('seo_twitter_handle') || '@riwaya_ma';
  const seoTwitterCard = await getSetting('seo_twitter_card') || 'summary_large_image';
  const seoTwitterImage = await getSetting('seo_twitter_image') || seoOgImage;
  const seoRobotsMeta = await getSetting('seo_robots_meta') || 'index, follow';
  const seoFavicon = await getSetting('seo_favicon_url') || '/favicon.ico';
  const googleVerification = await getSetting('seo_google_verification');
  const bingVerification = await getSetting('seo_bing_verification');
  const yandexVerification = await getSetting('seo_yandex_verification');
  const pinterestVerification = await getSetting('seo_pinterest_verification');

  const t = await getTranslations({ locale, namespace: 'HomePage.seo' });

  const title = seoTitle || t('Title') || "SuperEcom | Librairie en Ligne au Maroc - Livres, Packs & Échange de Livres";
  const description = seoDescription || t('Description') || "Découvrez SuperEcom, la librairie en ligne n°1 au Maroc. Achetez des livres de développement personnel, business, philosophie et romans. Échangez vos livres avec notre communauté. Livraison rapide partout au Maroc, paiement à la livraison.";

  const keywordsFr = [
    "livres maroc", "librairie en ligne maroc", "achat livres maroc", "superEcom",
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

  const baseKeywords = locale === 'ar' ? keywordsAr : keywordsFr;
  const keywords = seoKeywords ? seoKeywords.split(',').map(k => k.trim()) : baseKeywords;
  const ogLocale = locale === 'ar' ? 'ar_MA' : locale === 'en' ? 'en_MA' : 'fr_MA';

  const canIndex = seoRobotsMeta.includes('index');
  const canFollow = seoRobotsMeta.includes('follow');

  return {
    metadataBase: new URL(siteUrl),
    title: {
      template: "%s | SuperEcom",
      default: title,
    },
    description: description,
    keywords: keywords,
    authors: [{ name: seoAuthor, url: siteUrl }],
    creator: "SuperEcom",
    publisher: "SuperEcom",
    applicationName: "SuperEcom",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: title,
      description: description,
      url: siteUrl,
      siteName: "SuperEcom",
      locale: ogLocale,
      alternateLocale: ["fr_MA", "ar_MA", "en_MA"].filter(l => l !== ogLocale),
      type: seoOgType as any || "website",
      images: [
        {
          url: seoOgImage,
          width: parseInt(seoOgWidth) || 1200,
          height: parseInt(seoOgHeight) || 630,
          alt: seoOgAlt || title,
        },
      ],
    },
    twitter: {
      card: seoTwitterCard as any || "summary_large_image",
      title: title,
      description: description,
      creator: seoTwitterHandle,
      images: [seoTwitterImage],
    },
    robots: {
      index: canIndex,
      follow: canFollow,
      googleBot: {
        index: canIndex,
        follow: canFollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: seoFavicon,
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    category: 'products',
    verification: {
      google: googleVerification || undefined,
      yandex: yandexVerification || undefined,
      yahoo: undefined,
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
  const siteUrl = await getSetting('site_url') || 'https://superEcom.store';
  const injectedHeadTags = await getSetting('seo_injected_head_tags');
  const fbPixelId = await getSetting('facebook_pixel_id') || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
  const googleSearchConsoleId = await getSetting('google_search_console_id') || await getSetting('seo_google_verification');
  const googleAnalyticsId = await getSetting('google_analytics_id');
  const adsenseId = await getSetting('adsense_publisher_id');
  const adsenseEnabled = await getSetting('adsense_enabled');

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="lazyOnload"
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
          <Script 
            id="injected-head-tags"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: injectedHeadTags }} 
          />
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
        <Script
          id="schema-website"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              url: siteUrl,
              name: 'SuperEcom',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${siteUrl}/fr/products?search={search_term_string}`
                },
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
        <Script
          id="schema-org"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'SuperEcom',
              url: siteUrl,
              logo: `${siteUrl}/globe.svg`,
              sameAs: [
                facebook || 'https://facebook.com/superEcom',
                instagram || 'https://instagram.com/superEcom',
                twitter || 'https://twitter.com/superEcom',
                linkedin || 'https://linkedin.com/company/superEcom'
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
