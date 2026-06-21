import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const MOCK_PRODUCTS = [
  {
    id: 'mock-p1',
    name: 'Chikankari Hand-Embroidered Georgette Kurti',
    price: 2199,
    originalPrice: 2999,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80',
    images: '["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80"]',
    description: 'Exquisite hand-embroidered Lucknowi Chikankari georgette kurti set featuring delicate floral motifs and fine thread work. Pair with palazzos for an elegant ethnic style.',
    category: 'Kurtis',
    sizes: '["XS", "S", "M", "L", "XL", "XXL"]',
    colors: '["Peach", "Lavender", "White"]',
    fabric: 'Georgette & Cotton Lining',
    careInstr: 'Gentle hand wash inside out. Do not wring.',
    stock: 15,
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewCount: 24,
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-p2',
    name: 'Indigo Hand-Block Printed Cotton A-Line Kurti',
    price: 1399,
    originalPrice: 1899,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b44f0?w=1200&q=80',
    images: '["https://images.unsplash.com/photo-1594938298603-c8148c4b44f0?w=1200&q=80"]',
    description: 'Authentic Rajasthani hand-block printed indigo cotton kurti. Designed in a flowy A-line shape with a split neckline and contrast side borders. Extremely breathable.',
    category: 'Kurtis',
    sizes: '["S", "M", "L", "XL", "XXL"]',
    colors: '["Indigo Blue", "Off-White"]',
    fabric: '100% Organic Cotton',
    careInstr: 'Wash separately in cold water with mild detergent.',
    stock: 20,
    inStock: true,
    featured: true,
    rating: 4.5,
    reviewCount: 18,
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-p3',
    name: 'Royal Banarasi Silk Anarkali Gown',
    price: 3299,
    originalPrice: 4299,
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1200&q=80',
    images: '["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1200&q=80"]',
    description: 'A grand floor-length Banarasi silk Anarkali gown highlighting rich zari borders and traditional motifs. Perfect for weddings and festive occasions. Comes with a matching dupatta.',
    category: 'Kurtis',
    sizes: '["S", "M", "L", "XL"]',
    colors: '["Royal Purple", "Gold", "Pink"]',
    fabric: 'Banarasi Silk Blend',
    careInstr: 'Professional dry clean only. Store wrap in muslin.',
    stock: 8,
    inStock: true,
    featured: false,
    rating: 4.6,
    reviewCount: 9,
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-p4',
    name: 'Designer Raw Silk Aari-Work Blouse',
    price: 1699,
    originalPrice: 2499,
    image: 'https://images.unsplash.com/photo-1566206091558-f3d32ab7423e?w=1200&q=80',
    images: '["https://images.unsplash.com/photo-1566206091558-f3d32ab7423e?w=1200&q=80"]',
    description: 'Custom-stitched premium raw silk blouse showcasing intricate hand-crafted Maggam/Aari embroidery on the back and sleeves. Features an adjustable back dori with bells.',
    category: 'Blouses',
    sizes: '["34", "36", "38", "40", "42"]',
    colors: '["Crimson Red", "Forest Green", "Antique Gold"]',
    fabric: 'Pure Raw Silk',
    careInstr: 'Dry clean only. Do not fold the embroidery.',
    stock: 12,
    inStock: true,
    featured: true,
    rating: 4.7,
    reviewCount: 32,
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-p5',
    name: 'Velvet Padded Sleeveless Blouse',
    price: 1199,
    originalPrice: 1599,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
    images: '["https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80"]',
    description: 'Elegant sleeveless blouse made of heavy micro-velvet, padded with high-quality cups for a seamless look. Designed with a deep U-neck front and back.',
    category: 'Blouses',
    sizes: '["34", "36", "38", "40"]',
    colors: '["Royal Black", "Maroon", "Emerald Green"]',
    fabric: 'Micro-Velvet & Crepe Lining',
    careInstr: 'Dry clean or gentle hand wash. Steam iron from the inside.',
    stock: 10,
    inStock: true,
    featured: false,
    rating: 4.4,
    reviewCount: 11,
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-p6',
    name: 'Banarasi Brocade High-Neck Blouse',
    price: 1499,
    originalPrice: 1999,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80',
    images: '["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80"]',
    description: 'Sophisticated high-neck blouse stitched from traditional Banarasi brocade fabric. Features a front keyhole design and elbow-length sleeves with gold piping.',
    category: 'Blouses',
    sizes: '["36", "38", "40", "42"]',
    colors: '["Gold Brocade", "Pink Brocade"]',
    fabric: 'Silk Brocade',
    careInstr: 'Dry clean only.',
    stock: 6,
    inStock: true,
    featured: true,
    rating: 4.6,
    reviewCount: 14,
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-p7',
    name: 'Pure Kanchipuram Silk Fabric (Per Meter)',
    price: 899,
    originalPrice: 1299,
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=1200&q=80',
    images: '["https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=1200&q=80"]',
    description: 'Premium pure Kanchipuram silk material sold per meter. Features a lustrous dual-tone finish with woven zari border. Ideal for stitching custom designer blouses, skirts, or kurtas.',
    category: 'Fabrics',
    sizes: '["Per Meter"]',
    colors: '["Gold", "Pink", "Turquoise"]',
    fabric: '100% Kanchipuram Silk',
    careInstr: 'Dry clean only. Iron on silk setting from behind.',
    stock: 100,
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 15,
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-p8',
    name: 'Handloom Ikat Cotton Fabric (Per Meter)',
    price: 299,
    originalPrice: 399,
    image: 'https://images.unsplash.com/photo-1566206091558-f3d32ab7423e?w=1200&q=80',
    images: '["https://images.unsplash.com/photo-1566206091558-f3d32ab7423e?w=1200&q=80"]',
    description: 'Authentic hand-woven double Ikat cotton fabric from Pochampally. Hand-dyed using organic colors, perfect for customized daily-wear kurtis, shirts, or kidswear.',
    category: 'Fabrics',
    sizes: '["Per Meter"]',
    colors: '["Black-White", "Red-Black", "Blue-Gold"]',
    fabric: '100% Handloom Cotton',
    careInstr: 'Wash in cold water separately. First wash dry clean recommended.',
    stock: 150,
    inStock: true,
    featured: false,
    rating: 4.7,
    reviewCount: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-p9',
    name: 'Heavy Organza Floral Fabric (Per Meter)',
    price: 399,
    originalPrice: 499,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80',
    images: '["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80"]',
    description: 'Semi-sheer, stiff organza fabric featuring vibrant digital floral prints. Stitches beautiful voluminous skirts, light summer kurtis, or designer puff-sleeve overlays.',
    category: 'Fabrics',
    sizes: '["Per Meter"]',
    colors: '["Pink Floral", "Lilac Floral", "Mint Floral"]',
    fabric: 'Premium Polyester Organza',
    careInstr: 'Gentle hand wash. Do not squeeze. Iron on low heat under a cotton cloth.',
    stock: 200,
    inStock: true,
    featured: true,
    rating: 4.5,
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
      const catLower = category.toLowerCase();
      filtered = filtered.filter(p => p.category.toLowerCase() === catLower);
    }
    if (featured === 'true') {
      filtered = filtered.filter(p => p.featured);
    }
    return NextResponse.json(filtered);
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, price, originalPrice, image, images, description, category, sizes, colors, fabric, careInstr, featured } = body;
  const stock = body.stock !== undefined ? parseInt(body.stock) : 10;

  try {
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
  } catch (error: any) {
    console.warn('[API/products POST] Database unreachable. Saving product to in-memory mock catalog for sandbox testing:', error.message || error);
    
    const mockCreated = {
      id: 'mock-added-' + Math.random().toString(36).substring(2, 7),
      name,
      price: parseFloat(price) || 0,
      originalPrice: parseFloat(originalPrice) || 0,
      image: image || 'https://images.unsplash.com/photo-1594938298603-c8148c4b44f0?w=1200&q=80',
      images: images || '[]',
      description: description || 'Mock product description',
      category: category || 'Dresses',
      sizes: sizes || '[]',
      colors: colors || '[]',
      fabric: fabric || 'Cotton Blend',
      careInstr: careInstr || 'Dry clean only',
      stock,
      inStock: stock > 0,
      featured: featured === true,
      rating: 4.5,
      reviewCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    MOCK_PRODUCTS.push(mockCreated);
    return NextResponse.json(mockCreated, { status: 201 });
  }
}
