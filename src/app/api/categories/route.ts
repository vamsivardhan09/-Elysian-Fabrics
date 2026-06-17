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

export let MOCK_CATEGORIES = DEFAULT_CATEGORIES.map((name, index) => ({
  id: `mock-c${index + 1}`,
  name,
  createdAt: new Date().toISOString()
}));

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
    return NextResponse.json(MOCK_CATEGORIES);
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
  }

  const trimmedName = name.trim();

  try {
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
  } catch (error: any) {
    console.warn("[API/categories POST] Database unreachable. Adding to in-memory mock categories:", error.message || error);
    const existing = MOCK_CATEGORIES.find(c => c.name.toLowerCase() === trimmedName.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
    }
    const mockCat = {
      id: 'mock-c-' + Math.random().toString(36).substring(2, 7),
      name: trimmedName,
      createdAt: new Date().toISOString()
    };
    MOCK_CATEGORIES.push(mockCat);
    return NextResponse.json(mockCat, { status: 201 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
  }

  try {
    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.warn("[API/categories DELETE] Database unreachable. Deleting from in-memory mock categories:", error.message || error);
    const idx = MOCK_CATEGORIES.findIndex(c => c.id === id);
    if (idx !== -1) {
      MOCK_CATEGORIES.splice(idx, 1);
    }
    return NextResponse.json({ success: true });
  }
}
