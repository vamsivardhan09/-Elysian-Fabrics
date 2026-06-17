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
  const { id } = await params;
  const body = await request.json();
  const stock = body.stock !== undefined ? parseInt(body.stock) : 10;

  try {
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
  } catch (error: any) {
    console.warn('[API/products/[id] PUT] Database unreachable. Updating in-memory mock catalog:', error.message || error);
    
    // Find the product in memory to update it
    const idx = MOCK_PRODUCTS.findIndex(p => p.id === id);
    const mockUpdated = {
      id,
      name: body.name,
      price: parseFloat(body.price) || 0,
      originalPrice: parseFloat(body.originalPrice) || 0,
      image: body.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4b44f0?w=1200&q=80',
      images: body.images || '[]',
      description: body.description || 'Mock product description',
      category: body.category || 'Dresses',
      sizes: body.sizes || '[]',
      colors: body.colors || '[]',
      fabric: body.fabric || 'Cotton Blend',
      careInstr: body.careInstr || 'Dry clean only',
      stock,
      inStock: stock > 0,
      featured: body.featured === true,
      rating: idx !== -1 ? (MOCK_PRODUCTS[idx] as any).rating || 4.5 : 4.5,
      reviewCount: idx !== -1 ? (MOCK_PRODUCTS[idx] as any).reviewCount || 1 : 1,
      createdAt: idx !== -1 ? MOCK_PRODUCTS[idx].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (idx !== -1) {
      MOCK_PRODUCTS[idx] = mockUpdated;
    } else {
      MOCK_PRODUCTS.push(mockUpdated);
    }
    
    return NextResponse.json(mockUpdated);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.warn('[API/products/[id] DELETE] Database unreachable. Deleting from in-memory mock catalog:', error.message || error);
    const idx = MOCK_PRODUCTS.findIndex(p => p.id === id);
    if (idx !== -1) {
      MOCK_PRODUCTS.splice(idx, 1);
    }
    return NextResponse.json({ success: true });
  }
}
