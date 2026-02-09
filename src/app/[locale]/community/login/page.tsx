import Header from '@/components/HeaderWithUser'
import Footer from '@/components/Footer'
import LoginForm from '@/components/community/LoginForm'

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-pixio-cream flex flex-col">
            <Header />
            <main className="flex-grow flex items-center justify-center p-4 py-20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c')] bg-cover bg-center mix-blend-multiply" />
                <LoginForm />
            </main>
            <Footer />
        </div>
    )
}
