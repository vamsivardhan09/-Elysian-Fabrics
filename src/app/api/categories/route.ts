import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_CATEGORIES = [
  "Sarees",
  "Kurtis",
  "Blouses",
  "Anarkalis",
  "Bridal Collection",
  "Party Wear",
  "Western Wear",
  "Dresses"
];

export async function GET() {
  try {
    let categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    // Self-healing: if empty, seed defaults
    if (categories.length === 0) {
      await prisma.category.createMany({
        data: DEFAULT_CATEGORIES.map(name => ({ name }))
      });
      categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
      });
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.warn("[API/categories GET] Database unreachable. Falling back to default categories.", error);
    const mockCategories = DEFAULT_CATEGORIES.map((name, index) => ({
      id: `mock-c${index + 1}`,
      name,
      createdAt: new Date().toISOString()
    }));
    return NextResponse.json(mockCategories);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    
    // Check if duplicate
    const existing = await prisma.category.findUnique({
      where: { name: trimmedName }
    });
    if (existing) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: { name: trimmedName }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
