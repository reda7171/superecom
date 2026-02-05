import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import AnalyticsClient from './AnalyticsClient'

export default async function AnalyticsPage() {
    // Protection
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')
    if (!token) redirect('/admin/login')

    return <AnalyticsClient />
}
