import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const stock = body.stock !== undefined ? parseInt(body.stock) : 10;
    
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        price: parseFloat(body.price),
        originalPrice: parseFloat(body.originalPrice),
        image: body.image,
        images: body.images || '[]',
        description: body.description,
        category: body.category || 'Dresses',
        sizes: body.sizes || '[]',
        colors: body.colors || '[]',
        fabric: body.fabric,
        careInstr: body.careInstr,
        stock,
        inStock: stock > 0,
        featured: body.featured === true,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
