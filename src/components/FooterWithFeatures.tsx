// Server Component — lit les features et les passe au Footer client
import { getSetting, isFeatureEnabled } from '@/lib/actions/site-settings'
import Footer from './Footer'

export default async function FooterWithFeatures() {
    const [
        featureSeller,
        featureExchange,
        featureUsb,
        featureKids,
        featureReadingList,
        siteLogo,
        instagram,
        facebook,
        linkedin,
        twitter,
        youtube,
        threads,
    ] = await Promise.all([
        isFeatureEnabled('feature_seller', false),
        isFeatureEnabled('feature_exchange'),
        isFeatureEnabled('feature_usb_key'),
        isFeatureEnabled('feature_kids'),
        isFeatureEnabled('feature_reading_list'),
        getSetting('site_logo'),
        getSetting('social_instagram'),
        getSetting('social_facebook'),
        getSetting('social_linkedin'),
        getSetting('social_twitter'),
        getSetting('social_youtube'),
        getSetting('social_threads'),
    ])
 
    const features = {
        seller: featureSeller,
        exchange: featureExchange,
        usb: featureUsb,
        kids: featureKids,
        readingList: featureReadingList,
    }

    const socials = {
        instagram,
        facebook,
        linkedin,
        twitter,
        youtube,
        threads,
    }

    return <Footer features={features} siteLogo={siteLogo} socials={socials} />
}
