import { getCommunityUser } from '@/lib/actions/community-auth'
import UserDropdown from './UserDropdown'

export default async function UserDropdownWrapper() {
    const user = await getCommunityUser()

    return <UserDropdown user={user} />
}
