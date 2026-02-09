import { getCommunityUser } from '@/lib/actions/community-auth'
import { redirect } from 'next/navigation'
import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import ProfileEditForm from '@/components/community/ProfileEditForm'

export default async function ProfileEditPage() {
    const user = await getCommunityUser()

    if (!user) {
        redirect('/community/login')
    }

    // Adapt user object for client component props (filtering sensitive data)
    const userProps = {
        fullName: user.fullName || '',
        city: user.city || '',
        email: user.email,
        image: user.image,
        bio: user.bio,
        instagram: user.instagram,
        facebook: user.facebook,
        twitter: user.twitter,
    }

    return (
        <div className="min-h-screen bg-pixio-cream flex flex-col">
            <Header />
            <main className="flex-grow flex items-center justify-center p-4 py-20 relative overflow-hidden">
                <ProfileEditForm user={userProps} />
            </main>
            <Footer />
        </div>
    )
}
