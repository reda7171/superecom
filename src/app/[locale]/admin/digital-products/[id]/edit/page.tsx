import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import DigitalProductForm from '../../DigitalProductForm'

export default async function EditDigitalProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await prisma.digitalProduct.findUnique({ where: { id } })
  if (!product) notFound()

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Modifier le livre numérique</h1>
      <DigitalProductForm product={product} />
    </div>
  )
}
