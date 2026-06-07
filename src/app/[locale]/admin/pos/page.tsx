import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import POSClient from '@/components/admin/pos/POSClient';

export default async function POSPage() {
  const t = await getTranslations('Admin');

  const products = await prisma.product.findMany({
    where: { active: true, stock: { gt: 0 } },
    select: {
      id: true,
      title: true,
      price: true,
      image: true,
      stock: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const packs = await prisma.pack.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      price: true,
      image: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="h-[calc(100vh-80px)] w-full overflow-hidden">
      <POSClient products={products} packs={packs} />
    </div>
  );
}
