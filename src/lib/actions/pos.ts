'use server';

import { prisma } from '@/lib/prisma';
import { OrderStatus, OrderItemType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function createPOSOrder(data: {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  items: {
    id: string;
    type: 'BOOK' | 'PACK';
    quantity: number;
    price: number;
  }[];
  total: number;
  subtotal: number;
  discount: number;
  shippingFees: number;
}) {
  try {

    // Récupérer les prix de revient (costPrice) pour chaque article
    const itemsWithCost = await Promise.all(data.items.map(async (item) => {
      let costPrice = 0;
      if (item.type === 'BOOK') {
        const product = await prisma.product.findUnique({
          where: { id: item.id },
          select: { costPrice: true }
        });
        costPrice = product?.costPrice || 0;
      } else if (item.type === 'PACK') {
        const pack = await prisma.pack.findUnique({
          where: { id: item.id },
          select: { costPrice: true }
        });
        costPrice = pack?.costPrice || 0;
      }
      return { ...item, costPrice };
    }));

    const order = await prisma.order.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        total: data.total,
        subtotal: data.subtotal,
        discount: data.discount,
        shippingFees: data.shippingFees,
        status: OrderStatus.CONFIRMED,
        paymentMethod: 'CASH',
        items: {
          create: itemsWithCost.map((item) => ({
            type: item.type as OrderItemType,
            quantity: item.quantity,
            price: item.price,
            costPrice: item.costPrice,
            productId: item.type === 'BOOK' ? item.id : null,
            packId: item.type === 'PACK' ? item.id : null,
          })),
        },
      },
    });



    // Update stock for products
    for (const item of data.items) {
      if (item.type === 'BOOK') {
        await prisma.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        });
      } else if (item.type === 'PACK') {
        // Increment products in pack? (Optional depending on business logic)
        const pack = await prisma.pack.findUnique({
          where: { id: item.id },
          include: { products: true },
        });
        if (pack) {
          for (const pb of pack.products) {
            await prisma.product.update({
              where: { id: pb.productId },
              data: { stock: { decrement: item.quantity } },
            });
          }
        }
      }
    }

    revalidatePath('/admin/orders');

    try {
      const { getOrderById } = await import('@/lib/actions/orders');
      const fullOrder = await getOrderById(order.id);
      if (fullOrder) {
        const { sendOrderNotification } = await import('@/lib/telegram');
        sendOrderNotification(fullOrder as any).catch(console.error);
      }
    } catch (e) {
      console.error('Erreur Telegram Notification POS:', e);
    }

    return { success: true, orderId: order.id };
  } catch (error: any) {
    console.error('POS Order Error:', error);
    // Format error stack to return to client for debugging
    const errorMessage = String(error?.message || error);
    return { success: false, error: errorMessage };
  }
}
