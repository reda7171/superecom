import { getCommunityUser } from '@/lib/actions/community-auth'
import { redirect } from 'next/navigation'
import SellerSidebar from '@/components/seller/SellerSidebar'

export default async function SellerLayout({
    children,
    params
}: {
    children: React.ReactNode,
    params: Promise<{ locale: string }>
}) {
    const locale = (await params).locale
    const user = await getCommunityUser()

    if (!user || user.role !== 'SELLER') {
        redirect(`/${locale}/community/login`)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <SellerSidebar user={user} />
            
            {/* Main Content (Like Admin) */}
            <div className="pl-64 flex-grow">
                <main className="p-8 mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    )
}
