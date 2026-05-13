import { getCommunityUser } from '@/lib/actions/community-auth'
import Header from './Header'
import NotificationDropdownWrapper from './NotificationDropdownWrapper'
import { getActiveMenuBySlug } from '@/lib/actions/menus'
import { getSettingsByCategory } from '@/lib/actions/site-settings'

export default async function HeaderWithUser() {
    const [user, menu, featureSettings, generalSettings] = await Promise.all([
        getCommunityUser(),
        getActiveMenuBySlug('header'),
        getSettingsByCategory('features'),
        getSettingsByCategory('general')
    ])

    const userProps = user ? {
        fullName: user.fullName,
        email: user.email,
        image: user.image,
        role: user.role, // On passe le rôle pour la vérification admin
    } : null

    // Construire la map des fonctionnalités (true par défaut si non définie)
    const features = {
        seller: featureSettings['feature_seller'] !== 'false',
        exchange: featureSettings['feature_exchange'] !== 'false',
        usb: featureSettings['feature_usb'] !== 'false',
        kids: featureSettings['feature_kids'] !== 'false',
        readingList: featureSettings['feature_reading_list'] !== 'false',
        digital: featureSettings['feature_digital_books'] !== 'false',
        packs: featureSettings['feature_packs'] !== 'false',
    }

    return (
        <Header
            user={userProps}
            notificationDropdown={user ? <NotificationDropdownWrapper /> : null}
            navigation={menu?.items}
            features={features}
            siteLogo={generalSettings['site_logo'] || null}
        />
    )
}
