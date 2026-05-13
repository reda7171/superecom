import { getCommunityUser } from '@/lib/actions/community-auth'
import { getSettingsByCategory } from '@/lib/actions/site-settings'
import UserDropdown from './UserDropdown'

export default async function UserDropdownWrapper() {
    const [user, featureSettings] = await Promise.all([
        getCommunityUser(),
        getSettingsByCategory('features')
    ])

    const features = {
        readingList: featureSettings['feature_reading_list'] !== 'false',
        exchange: featureSettings['feature_exchange'] !== 'false',
    }

    return <UserDropdown user={user} features={features} />
}
