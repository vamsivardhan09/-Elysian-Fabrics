import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const orders = await prisma.order.findMany({
      where: {
        ...(userId ? { userId } : {})
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customerName, customerPhone, customerEmail, address, total, notes, userId } = body;

    const trackingId = 'ELY-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    // Ensure custom tailoring product exists if referenced
    const hasScratchItem = items.some((item: any) => item.productId === "custom-tailoring-scratch");
    if (hasScratchItem) {
      const exists = await prisma.product.findUnique({ where: { id: "custom-tailoring-scratch" } });
      if (!exists) {
        await prisma.product.create({
          data: {
            id: "custom-tailoring-scratch",
            name: "Custom Tailoring (From Scratch)",
            price: 0,
            originalPrice: 0,
            image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80",
            description: "Custom tailored outfit designed from scratch according to user style and measurements.",
            category: "Custom",
            sizes: "[]",
            colors: "[]",
            fabric: "Custom Choice",
            inStock: true,
            featured: false,
          }
        });
      }
    }

    const order = await prisma.order.create({
      data: {
        trackingId,
        total,
        customerName,
        customerPhone,
        customerEmail,
        address,
        notes,
        userId: userId || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            selectedSize: item.selectedSize || null,
            selectedColor: item.selectedColor || null,
            customization: item.customization || null,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

