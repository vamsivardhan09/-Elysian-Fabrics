import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Try to find by trackingId first
    let order = await prisma.order.findUnique({
      where: { trackingId: id },
      include: { items: { include: { product: true } } },
    });
    // Fall back to order id
    if (!order) {
      order = await prisma.order.findUnique({
        where: { id },
        include: { items: { include: { product: true } } },
      });
    }
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, trackingLink, notes, courierName, courierTrackingId, expectedDelivery } = body;

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(trackingLink !== undefined ? { trackingLink } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(courierName !== undefined ? { courierName } : {}),
        ...(courierTrackingId !== undefined ? { courierTrackingId } : {}),
        ...(expectedDelivery !== undefined ? { expectedDelivery } : {}),
      },
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
