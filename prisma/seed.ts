import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clear existing products to avoid duplication on re-seeding
  await prisma.product.deleteMany({});

  const products = [
    {
      name: 'Embellished Banarasi Silk Saree',
      price: 4999,
      originalPrice: 6999,
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80',
        'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1200&q=80'
      ]),
      description: 'Handcrafted luxury Banarasi silk saree adorned with intricate gold zari brocade work. Perfect for grand weddings, festive rituals, and cultural celebrations.',
      category: 'Sarees',
      sizes: JSON.stringify(['One Size']),
      colors: JSON.stringify(['Red', 'Gold', 'Pink']),
      fabric: 'Pure Banarasi Silk',
      careInstr: 'Dry clean only. Store wrapped in muslin cloth to preserve the zari shine.',
      inStock: true,
      featured: true,
    },
    {
      name: 'Pastel Floral Kurti with Palazzo Set',
      price: 1899,
      originalPrice: 2499,
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b44f0?w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1594938298603-c8148c4b44f0?w=1200&q=80'
      ]),
      description: 'Elegant daywear floral printed georgette kurti set featuring delicate pearl hand embroidery on the neckline, paired with breathable georgette palazzos.',
      category: 'Kurtis',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Blue', 'Peach', 'Lavender']),
      fabric: 'Georgette & Cotton Lining',
      careInstr: 'Gentle hand wash inside out. Do not bleach. Dry in shade.',
      inStock: true,
      featured: true,
    },
    {
      name: 'Royal Brown & Pink Anarkali Gown',
      price: 2299,
      originalPrice: 2999,
      image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1200&q=80'
      ]),
      description: 'Beautiful full-length Anarkali gown showcasing contrasting rust-brown geometric borders and vibrant pink floral motifs. Comes with a matching dupatta and cotton churidar.',
      category: 'Anarkali',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['Brown', 'Pink']),
      fabric: 'Premium Rayon-Cotton Blend',
      careInstr: 'Dry clean first wash. Subsqeuent washes: cold gentle cycle, light iron.',
      inStock: true,
      featured: false,
    },
    {
      name: 'Teal Floral Peplum with Purple Skirt',
      price: 2799,
      originalPrice: 3499,
      image: 'https://images.unsplash.com/photo-1566206091558-f3d32ab7423e?w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1566206091558-f3d32ab7423e?w=1200&q=80',
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80'
      ]),
      description: 'Modern ethnic fusion set featuring a teal floral printed silk peplum top and a high-waisted gathered raw silk skirt in deep purple.',
      category: 'Party Wear',
      sizes: JSON.stringify(['S', 'M', 'L']),
      colors: JSON.stringify(['Teal', 'Purple', 'Gold']),
      fabric: 'Raw Silk & Georgette',
      careInstr: 'Dry clean only. Avoid spraying perfume directly on fabric.',
      inStock: true,
      featured: true,
    },
    {
      name: 'Embroidered Crimson Bridal Lehenga',
      price: 12499,
      originalPrice: 18999,
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80'
      ]),
      description: 'Exquisite bridal lehenga set crafted from premium heavy micro-velvet, showcasing antique gold tilla and zardozi embroidery. Includes net dupatta with borders.',
      category: 'Bridal Collection',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Maroon', 'Gold', 'Red']),
      fabric: 'Premium Micro-Velvet & Net',
      careInstr: 'Professional dry clean only. Store in a cool, moisture-free garment bag.',
      inStock: true,
      featured: true,
    },
    {
      name: 'Flowing Pastel Pink Chiffon Dress',
      price: 1599,
      originalPrice: 2199,
      image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=1200&q=80'
      ]),
      description: 'A contemporary floor-length dress made of breathable pastel pink chiffon, featuring a pleated bodice and a chic cape overlay.',
      category: 'Dresses',
      sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
      colors: JSON.stringify(['Rose', 'Peach']),
      fabric: 'Premium Chiffon & Crepe lining',
      careInstr: 'Hand wash cold or gentle machine wash in a laundry bag. Hang to dry.',
      inStock: true,
      featured: false,
    },
    {
      name: 'Emerald Green Satin Evening Gown',
      price: 3200,
      originalPrice: 4500,
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80'
      ]),
      description: 'Turn heads in this premium satin green maxi gown. Featuring a draped cowl neckline, side thigh-high slit, and an adjustable cross-back strap.',
      category: 'Western Wear',
      sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Green', 'Black', 'Gold']),
      fabric: 'Stretch Satin',
      careInstr: 'Dry clean recommended. Iron inside out on very low steam.',
      inStock: true,
      featured: true,
    }
  ];

  for (const item of products) {
    await prisma.product.create({
      data: item
    });
  }

  // Create an admin user
  const hashedAdminPassword = await bcrypt.hash('admin', 10);
  await prisma.user.upsert({
    where: { email: 'admin@elysian.com' },
    update: {
      password: hashedAdminPassword
    },
    create: {
      email: 'admin@elysian.com',
      password: hashedAdminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('Database seeded successfully with 7 premium products!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
