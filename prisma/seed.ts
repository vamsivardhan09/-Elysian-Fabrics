import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Resetting catalog database...');
  // Clear existing catalog items to avoid duplication
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.boutiqueSettings.deleteMany({});

  // Seed Boutique Settings
  await prisma.boutiqueSettings.create({
    data: {
      shopName: "Elysian Custom Boutique",
      shopAddress: "Plot 42, Shilpa Hills, Madhapur, Hyderabad, Telangana, 500081",
      contactPhone: "+91 98765 43210"
    }
  });
  console.log('Boutique Settings seeded.');

  // Seed Categories
  const categories = ['Kurtis', 'Blouses', 'Fabrics'];
  for (const catName of categories) {
    await prisma.category.create({
      data: { name: catName }
    });
  }
  console.log('Categories seeded:', categories);

  const products = [
    {
      name: 'Chikankari Hand-Embroidered Georgette Kurti',
      price: 2199,
      originalPrice: 2999,
      image: 'https://images.unsplash.com/photo-1608748010899-18f300247112?w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1608748010899-18f300247112?w=1200&q=80'
      ]),
      description: 'Exquisite hand-embroidered Lucknowi Chikankari georgette kurti set featuring delicate floral motifs and fine thread work. Pair with palazzos for an elegant ethnic style.',
      category: 'Kurtis',
      sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['Peach', 'Lavender', 'White']),
      fabric: 'Georgette & Cotton Lining',
      careInstr: 'Gentle hand wash inside out. Do not wring.',
      stock: 15,
      inStock: true,
      featured: true,
    },
    {
      name: 'Indigo Hand-Block Printed Cotton A-Line Kurti',
      price: 1399,
      originalPrice: 1899,
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=1200&q=80'
      ]),
      description: 'Authentic Rajasthani hand-block printed indigo cotton kurti. Designed in a flowy A-line shape with a split neckline and contrast side borders. Extremely breathable.',
      category: 'Kurtis',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['Indigo Blue', 'Off-White']),
      fabric: '100% Organic Cotton',
      careInstr: 'Wash separately in cold water with mild detergent.',
      stock: 20,
      inStock: true,
      featured: true,
    },
    {
      name: 'Royal Banarasi Silk Anarkali Gown',
      price: 3299,
      originalPrice: 4299,
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80'
      ]),
      description: 'A grand floor-length Banarasi silk Anarkali gown highlighting rich zari borders and traditional motifs. Perfect for weddings and festive occasions. Comes with a matching dupatta.',
      category: 'Kurtis',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Royal Purple', 'Gold', 'Pink']),
      fabric: 'Banarasi Silk Blend',
      careInstr: 'Professional dry clean only. Store wrap in muslin.',
      stock: 8,
      inStock: true,
      featured: false,
    },
    {
      name: 'Designer Raw Silk Aari-Work Blouse',
      price: 1699,
      originalPrice: 2499,
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1200&q=80'
      ]),
      description: 'Custom-stitched premium raw silk blouse showcasing intricate hand-crafted Maggam/Aari embroidery on the back and sleeves. Features an adjustable back dori with bells.',
      category: 'Blouses',
      sizes: JSON.stringify(['34', '36', '38', '40', '42']),
      colors: JSON.stringify(['Crimson Red', 'Forest Green', 'Antique Gold']),
      fabric: 'Pure Raw Silk',
      careInstr: 'Dry clean only. Do not fold the embroidery.',
      stock: 12,
      inStock: true,
      featured: true,
    },
    {
      name: 'Velvet Padded Sleeveless Blouse',
      price: 1199,
      originalPrice: 1599,
      image: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=1200&q=80'
      ]),
      description: 'Elegant sleeveless blouse made of heavy micro-velvet, padded with high-quality cups for a seamless look. Designed with a deep U-neck front and back.',
      category: 'Blouses',
      sizes: JSON.stringify(['34', '36', '38', '40']),
      colors: JSON.stringify(['Royal Black', 'Maroon', 'Emerald Green']),
      fabric: 'Micro-Velvet & Crepe Lining',
      careInstr: 'Dry clean or gentle hand wash. Steam iron from the inside.',
      stock: 10,
      inStock: true,
      featured: false,
    },
    {
      name: 'Banarasi Brocade High-Neck Blouse',
      price: 1499,
      originalPrice: 1999,
      image: 'https://images.unsplash.com/photo-1617626033036-7c010b991ea4?w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1617626033036-7c010b991ea4?w=1200&q=80'
      ]),
      description: 'Sophisticated high-neck blouse stitched from traditional Banarasi brocade fabric. Features a front keyhole design and elbow-length sleeves with gold piping.',
      category: 'Blouses',
      sizes: JSON.stringify(['36', '38', '40', '42']),
      colors: JSON.stringify(['Gold Brocade', 'Pink Brocade']),
      fabric: 'Silk Brocade',
      careInstr: 'Dry clean only.',
      stock: 6,
      inStock: true,
      featured: true,
    },
    {
      name: 'Pure Kanchipuram Silk Fabric (Per Meter)',
      price: 899,
      originalPrice: 1299,
      image: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=1200&q=80'
      ]),
      description: 'Premium pure Kanchipuram silk material sold per meter. Features a lustrous dual-tone finish with woven zari border. Ideal for stitching custom designer blouses, skirts, or kurtas.',
      category: 'Fabrics',
      sizes: JSON.stringify(['Per Meter']),
      colors: JSON.stringify(['Gold', 'Pink', 'Turquoise']),
      fabric: '100% Kanchipuram Silk',
      careInstr: 'Dry clean only. Iron on silk setting from behind.',
      stock: 100,
      inStock: true,
      featured: true,
    },
    {
      name: 'Handloom Ikat Cotton Fabric (Per Meter)',
      price: 299,
      originalPrice: 399,
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80'
      ]),
      description: 'Authentic hand-woven double Ikat cotton fabric from Pochampally. Hand-dyed using organic colors, perfect for customized daily-wear kurtis, shirts, or kidswear.',
      category: 'Fabrics',
      sizes: JSON.stringify(['Per Meter']),
      colors: JSON.stringify(['Black-White', 'Red-Black', 'Blue-Gold']),
      fabric: '100% Handloom Cotton',
      careInstr: 'Wash in cold water separately. First wash dry clean recommended.',
      stock: 150,
      inStock: true,
      featured: false,
    },
    {
      name: 'Heavy Organza Floral Fabric (Per Meter)',
      price: 399,
      originalPrice: 499,
      image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1574169208507-84376144848b?w=1200&q=80'
      ]),
      description: 'Semi-sheer, stiff organza fabric featuring vibrant digital floral prints. Stitches beautiful voluminous skirts, light summer kurtis, or designer puff-sleeve overlays.',
      category: 'Fabrics',
      sizes: JSON.stringify(['Per Meter']),
      colors: JSON.stringify(['Pink Floral', 'Lilac Floral', 'Mint Floral']),
      fabric: 'Premium Polyester Organza',
      careInstr: 'Gentle hand wash. Do not squeeze. Iron on low heat under a cotton cloth.',
      stock: 200,
      inStock: true,
      featured: true,
    }
  ];

  for (const item of products) {
    await prisma.product.create({
      data: item
    });
  }

  // Create or Update admin user
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

  console.log('Catalog re-seeded successfully with Desi boutique custom products!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
