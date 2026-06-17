import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MOCK_PRODUCTS } from '../route';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Check mock products first if ID starts with 'mock-'
    if (id && id.startsWith('mock-')) {
      const mockProd = MOCK_PRODUCTS.find(p => p.id === id);
      if (mockProd) return NextResponse.json(mockProd);
    }

    try {
      const product = await prisma.product.findUnique({ where: { id } });
      if (product) return NextResponse.json(product);
    } catch (dbError) {
      console.warn('[API/products/[id] GET] Database unreachable. Falling back to mock data lookup.', dbError);
    }

    // Fallback search in mock products if DB query returned null or failed
    const fallbackProd = MOCK_PRODUCTS.find(p => p.id === id);
    if (fallbackProd) return NextResponse.json(fallbackProd);

    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  } catch (error) {
    console.error(error);
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
