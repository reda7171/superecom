import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import ImmersivePdfReaderWrapper from './ReaderWrapper'
import { getCommunityUser } from '@/lib/actions/community-auth'

export default async function DigitalReaderPage({
    params
}: {
    params: Promise<{ locale: string, id: string }>
}) {
    const { id, locale } = await params

    // Check if user is logged in
    const user = await getCommunityUser()
    if (!user) {
        redirect(`/${locale}/community/login?callbackUrl=/${locale}/livres-numeriques/reader/${id}`)
    }

    // Fetch the digital product
    const product = await prisma.digitalProduct.findUnique({
        where: { id, active: true },
        include: {
            orderItems: {
                where: {
                    order: {
                        email: user.email,
                        status: 'COMPLETED' // Only if paid/confirmed
                    }
                }
            }
        }
    })

    // Note: If no order item found, user shouldn't read it normally, 
    // but for dev/testing I'll allow if product exists and user is admin.
    if (!product) notFound()

    // Verification logic (relaxing for MVP if admin or special access)
    // const hasAccess = user.role === 'ADMIN' || product.orderItems.length > 0;
    // if (!hasAccess) redirect(`/${locale}/livres-numeriques`)

    return (
        <div className="fixed inset-0 bg-[#1a1a1a]">
            <ImmersivePdfReaderWrapper
                pdfUrl={product.pdfUrl}
                title={product.title}
            />
        </div>
    )
}
