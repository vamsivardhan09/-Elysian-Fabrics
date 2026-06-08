import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const products = await prisma.product.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(featured === 'true' ? { featured: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, originalPrice, image, images, description, category, sizes, colors, fabric, careInstr, featured } = body;
    const stock = body.stock !== undefined ? parseInt(body.stock) : 10;

    const newProduct = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        originalPrice: parseFloat(originalPrice),
        image,
        images: images || '[]',
        description,
        category: category || 'Dresses',
        sizes: sizes || '[]',
        colors: colors || '[]',
        fabric,
        careInstr,
        stock,
        inStock: stock > 0,
        featured: featured === true,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
