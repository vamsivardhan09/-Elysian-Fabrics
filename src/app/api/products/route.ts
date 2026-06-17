import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const MOCK_PRODUCTS = [
  {
    id: 'mock-p1',
    name: 'Embellished Banarasi Silk Saree',
    price: 4999,
    originalPrice: 6999,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80',
    images: '["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80", "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1200&q=80"]',
    description: 'Handcrafted luxury Banarasi silk saree adorned with intricate gold zari brocade work. Perfect for grand weddings, festive rituals, and cultural celebrations.',
    category: 'Sarees',
    sizes: '["One Size"]',
    colors: '["Red", "Gold", "Pink"]',
    fabric: 'Pure Banarasi Silk',
    careInstr: 'Dry clean only. Store wrapped in muslin cloth to preserve the zari shine.',
    stock: 5,
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewCount: 24,
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-p2',
    name: 'Pastel Floral Kurti with Palazzo Set',
    price: 1899,
    originalPrice: 2499,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b44f0?w=1200&q=80',
    images: '["https://images.unsplash.com/photo-1594938298603-c8148c4b44f0?w=1200&q=80"]',
    description: 'Elegant daywear floral printed georgette kurti set featuring delicate pearl hand embroidery on the neckline, paired with breathable georgette palazzos.',
    category: 'Kurtis',
    sizes: '["S", "M", "L", "XL"]',
    colors: '["Blue", "Peach", "Lavender"]',
    fabric: 'Georgette & Cotton Lining',
    careInstr: 'Gentle hand wash inside out. Do not bleach. Dry in shade.',
    stock: 12,
    inStock: true,
    featured: true,
    rating: 4.5,
    reviewCount: 18,
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-p3',
    name: 'Embroidered Crimson Bridal Lehenga',
    price: 12499,
    originalPrice: 18999,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
    images: '["https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80"]',
    description: 'Exquisite bridal lehenga set crafted from premium heavy micro-velvet, showcasing antique gold tilla and zardozi embroidery. Includes net dupatta with borders.',
    category: 'Bridal Collection',
    sizes: '["S", "M", "L"]',
    colors: '["Crimson", "Maroon", "Gold"]',
    fabric: 'Premium Micro-Velvet & Net',
    careInstr: 'Professional dry clean only. Store in a cool, moisture-free garment bag.',
    stock: 3,
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 15,
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-p4',
    name: 'Royal Purple Silk Anarkali Gown',
    price: 3299,
    originalPrice: 4299,
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1200&q=80',
    images: '["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1200&q=80"]',
    description: 'Beautiful full-length Anarkali gown showcasing contrasting rust-brown geometric borders and vibrant pink floral motifs. Comes with a matching dupatta and cotton churidar.',
    category: 'Anarkalis',
    sizes: '["S", "M", "L", "XL"]',
    colors: '["Purple", "Pink"]',
    fabric: 'Premium Rayon-Cotton Blend',
    careInstr: 'Dry clean first wash. Subsequent washes: cold gentle cycle, light iron.',
    stock: 8,
    inStock: true,
    featured: true,
    rating: 4.6,
    reviewCount: 9,
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-p5',
    name: 'Custom Embroidered Designer Blouse',
    price: 1499,
    originalPrice: 1999,
    image: 'https://images.unsplash.com/photo-1566206091558-f3d32ab7423e?w=1200&q=80',
    images: '["https://images.unsplash.com/photo-1566206091558-f3d32ab7423e?w=1200&q=80"]',
    description: 'Bespoke custom-stitched designer blouse featuring exquisite Maggam/Aari hand embroidery on raw silk. Padded with high-quality cups and adjustable strings.',
    category: 'Blouses',
    sizes: '["34", "36", "38", "40"]',
    colors: '["Gold", "Pink", "Green"]',
    fabric: 'Raw Silk with Cotton Lining',
    careInstr: 'Dry clean only. Do not fold embroidery.',
    stock: 20,
    inStock: true,
    featured: false,
    rating: 4.7,
    reviewCount: 32,
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-p6',
    name: 'Indo-Western Fusion Crop Top & Cape Set',
    price: 3499,
    originalPrice: 4499,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80',
    images: '["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80"]',
    description: 'A stylish Indo-western shrug cape set featuring a gold-printed crop top, flared palazzo pants, and a flowy georgette floral printed long cape.',
    category: 'Western Wear',
    sizes: '["S", "M", "L"]',
    colors: '["Yellow", "Gold", "White"]',
    fabric: 'Georgette & Raw Silk',
    careInstr: 'Dry clean only. Low heat iron.',
    stock: 15,
    inStock: true,
    featured: true,
    rating: 4.6,
    reviewCount: 14,
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-p7',
    name: 'Bohemian Floral Maxi Dress',
    price: 2499,
    originalPrice: 3299,
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=1200&q=80',
    images: '["https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=1200&q=80"]',
    description: 'A chic full-length bohemian maxi dress with tie-up shoulder straps, elasticated waist, and beautiful hand-block printed indigo floral motifs.',
    category: 'Dresses',
    sizes: '["S", "M", "L", "XL"]',
    colors: '["Blue", "White"]',
    fabric: '100% Organic Cotton',
    careInstr: 'Machine wash cold. Do not tumble dry.',
    stock: 9,
    inStock: true,
    featured: false,
    rating: 4.4,
    reviewCount: 11,
    createdAt: new Date().toISOString()
  }
];

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
    console.warn('[API/products GET] Database unreachable. Falling back to high-fidelity mock data.', error);
    
    // Parse query params for mock filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    let filtered = MOCK_PRODUCTS;
    if (category) {
      // Allow flexible matching for "Bridal Wear" vs "Bridal Collection" and "Anarkali" vs "Anarkalis"
      const catLower = category.toLowerCase();
      if (catLower === 'bridal wear' || catLower === 'bridal collection') {
        filtered = filtered.filter(p => p.category.toLowerCase() === 'bridal wear' || p.category.toLowerCase() === 'bridal collection');
      } else if (catLower === 'anarkali' || catLower === 'anarkalis') {
        filtered = filtered.filter(p => p.category.toLowerCase() === 'anarkali' || p.category.toLowerCase() === 'anarkalis');
      } else {
        filtered = filtered.filter(p => p.category.toLowerCase() === catLower);
      }
    }
    if (featured === 'true') {
      filtered = filtered.filter(p => p.featured);
    }
    return NextResponse.json(filtered);
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
