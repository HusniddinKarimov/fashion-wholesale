import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

const products = [
  // MEN
  { sku: "MN-001", name: "Oxford Slim-Fit Shirt", category: "Men", material: "100% Egyptian Cotton", colours: '["White","Sky Blue","Pale Pink","Lavender"]', unitPrice: 28.5, moq: 24, stock: 240, imageUrl: "https://picsum.photos/seed/mn001/400/500", description: "Classic slim-fit Oxford shirt with button-down collar", popularity: 95 },
  { sku: "MN-002", name: "Cargo Utility Trousers", category: "Men", material: "98% Cotton 2% Elastane", colours: '["Khaki","Olive","Navy","Black"]', unitPrice: 42.0, moq: 12, stock: 180, imageUrl: "https://picsum.photos/seed/mn002/400/500", description: "Multi-pocket cargo trousers with adjustable waist", popularity: 82 },
  { sku: "MN-003", name: "Merino Wool Crewneck Sweater", category: "Men", material: "100% Merino Wool", colours: '["Charcoal","Camel","Forest Green","Burgundy"]', unitPrice: 64.0, moq: 12, stock: 96, imageUrl: "https://picsum.photos/seed/mn003/400/500", description: "Fine-gauge merino wool crewneck for layering", popularity: 78 },
  { sku: "MN-004", name: "Stretch Chino Trousers", category: "Men", material: "97% Cotton 3% Elastane", colours: '["Stone","Navy","Olive","Tan"]', unitPrice: 36.5, moq: 24, stock: 312, imageUrl: "https://picsum.photos/seed/mn004/400/500", description: "Slim stretch chinos with 4-way comfort flex", popularity: 91 },
  { sku: "MN-005", name: "Linen Blend Blazer", category: "Men", material: "55% Linen 45% Cotton", colours: '["Beige","Light Grey","Navy"]', unitPrice: 88.0, moq: 6, stock: 42, imageUrl: "https://picsum.photos/seed/mn005/400/500", description: "Unstructured linen blazer, ideal for warm seasons", popularity: 67 },
  { sku: "MN-006", name: "Graphic Print T-Shirt", category: "Men", material: "100% Organic Cotton", colours: '["White","Black","Grey","Stone"]', unitPrice: 18.0, moq: 36, stock: 480, imageUrl: "https://picsum.photos/seed/mn006/400/500", description: "Premium organic cotton tee with seasonal graphic print", popularity: 88 },
  { sku: "MN-007", name: "Ripstop Field Jacket", category: "Men", material: "100% Polyester Ripstop", colours: '["Olive","Black","Tan"]', unitPrice: 76.0, moq: 6, stock: 28, imageUrl: "https://picsum.photos/seed/mn007/400/500", description: "Lightweight field jacket with multiple utility pockets", popularity: 73 },
  { sku: "MN-008", name: "Classic Denim Jeans", category: "Men", material: "98% Cotton 2% Elastane Denim", colours: '["Mid Blue","Dark Blue","Black"]', unitPrice: 44.0, moq: 12, stock: 0, imageUrl: "https://picsum.photos/seed/mn008/400/500", description: "Straight-leg denim jeans with 5-pocket styling", popularity: 86 },
  { sku: "MN-009", name: "Pique Polo Shirt", category: "Men", material: "100% Cotton Pique", colours: '["White","Navy","Forest Green","Wine Red"]', unitPrice: 24.0, moq: 24, stock: 336, imageUrl: "https://picsum.photos/seed/mn009/400/500", description: "Classic polo with embroidered logo and ribbed collar", popularity: 79 },
  { sku: "MN-010", name: "Thermal Padded Gilet", category: "Men", material: "Shell: 100% Nylon, Fill: Recycled Polyester", colours: '["Black","Navy","Olive","Rust"]', unitPrice: 56.0, moq: 12, stock: 144, imageUrl: "https://picsum.photos/seed/mn010/400/500", description: "Lightweight insulated gilet, packable into chest pocket", popularity: 70 },
  { sku: "MN-011", name: "Slim Tuxedo Trousers", category: "Men", material: "100% Wool Blend", colours: '["Black","Midnight Navy"]', unitPrice: 72.0, moq: 6, stock: 36, imageUrl: "https://picsum.photos/seed/mn011/400/500", description: "Slim-cut tuxedo trousers with satin side stripe", popularity: 55 },
  { sku: "MN-012", name: "Waffle Knit Henley", category: "Men", material: "100% Cotton Waffle Knit", colours: '["Oatmeal","Slate","Forest"]', unitPrice: 22.0, moq: 24, stock: 192, imageUrl: "https://picsum.photos/seed/mn012/400/500", description: "Textured waffle henley with 3-button placket", popularity: 76 },
  // WOMEN
  { sku: "WM-001", name: "Ribbed Knit Dress", category: "Women", material: "75% Viscose 25% Polyamide", colours: '["Ivory","Black","Caramel","Sage"]', unitPrice: 52.0, moq: 12, stock: 144, imageUrl: "https://picsum.photos/seed/wm001/400/500", description: "Form-fitting ribbed midi dress with scoop neck", popularity: 94 },
  { sku: "WM-002", name: "Wide-Leg Linen Trousers", category: "Women", material: "100% Linen", colours: '["Ecru","Terracotta","Navy","Sage"]', unitPrice: 46.0, moq: 12, stock: 168, imageUrl: "https://picsum.photos/seed/wm002/400/500", description: "Relaxed wide-leg trousers in breathable linen", popularity: 87 },
  { sku: "WM-003", name: "Satin Wrap Blouse", category: "Women", material: "100% Polyester Satin", colours: '["Champagne","Blush","Deep Burgundy","Cobalt"]', unitPrice: 38.0, moq: 12, stock: 19, imageUrl: "https://picsum.photos/seed/wm003/400/500", description: "Elegant wrap blouse with adjustable self-tie belt", popularity: 89 },
  { sku: "WM-004", name: "Tailored Cigarette Trousers", category: "Women", material: "65% Polyester 35% Viscose", colours: '["Black","Camel","Check"]', unitPrice: 54.0, moq: 12, stock: 120, imageUrl: "https://picsum.photos/seed/wm004/400/500", description: "High-waist tailored trousers with cropped ankle length", popularity: 83 },
  { sku: "WM-005", name: "Oversized Blazer Jacket", category: "Women", material: "70% Polyester 30% Viscose", colours: '["Cream","Black","Houndstooth"]', unitPrice: 82.0, moq: 6, stock: 0, imageUrl: "https://picsum.photos/seed/wm005/400/500", description: "Oversized double-breasted blazer with padded shoulders", popularity: 92 },
  { sku: "WM-006", name: "Floral Midi Skirt", category: "Women", material: "100% Viscose", colours: '["Floral Multi","Black Floral"]', unitPrice: 34.0, moq: 12, stock: 96, imageUrl: "https://picsum.photos/seed/wm006/400/500", description: "Fluid midi skirt with elasticated waistband and floral print", popularity: 81 },
  { sku: "WM-007", name: "Cashmere Blend Cardigan", category: "Women", material: "30% Cashmere 70% Merino", colours: '["Oatmeal","Dusty Rose","Slate Blue","Camel"]', unitPrice: 96.0, moq: 6, stock: 48, imageUrl: "https://picsum.photos/seed/wm007/400/500", description: "Luxurious cashmere blend open-front cardigan", popularity: 76 },
  { sku: "WM-008", name: "Poplin Shirt Dress", category: "Women", material: "100% Cotton Poplin", colours: '["White","Sky Blue","Stripe"]', unitPrice: 58.0, moq: 12, stock: 132, imageUrl: "https://picsum.photos/seed/wm008/400/500", description: "Classic shirt dress with belted waist and shirt collar", popularity: 85 },
  { sku: "WM-009", name: "Ruched Bodycon Dress", category: "Women", material: "90% Polyester 10% Elastane", colours: '["Black","Nude","Forest Green"]', unitPrice: 44.0, moq: 12, stock: 6, imageUrl: "https://picsum.photos/seed/wm009/400/500", description: "Ruched bodycon midi dress with side slit", popularity: 90 },
  { sku: "WM-010", name: "Teddy Fleece Zip-Up", category: "Women", material: "100% Polyester Teddy Fleece", colours: '["Cream","Blush","Chocolate"]', unitPrice: 62.0, moq: 12, stock: 84, imageUrl: "https://picsum.photos/seed/wm010/400/500", description: "Cosy teddy fleece zip-up jacket with patch pockets", popularity: 79 },
  { sku: "WM-011", name: "Smocked Broderie Blouse", category: "Women", material: "100% Cotton Broderie", colours: '["White","Sage"]', unitPrice: 36.0, moq: 12, stock: 72, imageUrl: "https://picsum.photos/seed/wm011/400/500", description: "Romantic smocked blouse with broderie anglaise fabric", popularity: 72 },
  // KIDS
  { sku: "KD-001", name: "Cotton Jersey Dungarees", category: "Kids", material: "100% Organic Cotton Jersey", colours: '["Denim Blue","Cream","Sage"]', unitPrice: 22.0, moq: 24, stock: 288, imageUrl: "https://picsum.photos/seed/kd001/400/500", description: "Comfortable jersey dungarees with adjustable straps", popularity: 88 },
  { sku: "KD-002", name: "Fleece Zip-Up Hoodie", category: "Kids", material: "100% Polyester Fleece", colours: '["Navy","Grey Marl","Pink","Red"]', unitPrice: 18.0, moq: 24, stock: 360, imageUrl: "https://picsum.photos/seed/kd002/400/500", description: "Soft anti-pill fleece hoodie with front zip", popularity: 91 },
  { sku: "KD-003", name: "Printed Pyjama Set", category: "Kids", material: "100% Cotton", colours: '["Dino Print","Star Print","Floral Print"]', unitPrice: 16.0, moq: 24, stock: 432, imageUrl: "https://picsum.photos/seed/kd003/400/500", description: "Soft cotton pyjama set with cute print, long sleeve", popularity: 93 },
  { sku: "KD-004", name: "Elasticated Jogger Pants", category: "Kids", material: "80% Cotton 20% Polyester", colours: '["Grey Marl","Navy","Black","Khaki"]', unitPrice: 14.0, moq: 36, stock: 504, imageUrl: "https://picsum.photos/seed/kd004/400/500", description: "Comfortable jogger pants with elasticated waist and cuffs", popularity: 86 },
  { sku: "KD-005", name: "Waterproof Rain Jacket", category: "Kids", material: "100% Polyester with PU Coating", colours: '["Yellow","Red","Navy","Teal"]', unitPrice: 32.0, moq: 12, stock: 144, imageUrl: "https://picsum.photos/seed/kd005/400/500", description: "Fully waterproof hooded rain jacket, taped seams", popularity: 84 },
  { sku: "KD-006", name: "Graphic Tee 3-Pack", category: "Kids", material: "100% Cotton", colours: '["Mixed Pack"]', unitPrice: 20.0, moq: 24, stock: 0, imageUrl: "https://picsum.photos/seed/kd006/400/500", description: "3-pack of cotton tees with seasonal graphic prints", popularity: 78 },
  { sku: "KD-007", name: "Corduroy Shirt", category: "Kids", material: "100% Cotton Corduroy", colours: '["Rust","Forest Green","Navy"]', unitPrice: 24.0, moq: 12, stock: 36, imageUrl: "https://picsum.photos/seed/kd007/400/500", description: "Fine-wale corduroy shirt with button collar", popularity: 70 },
  { sku: "KD-008", name: "Knitted Cardigan", category: "Kids", material: "100% Merino Wool", colours: '["Oatmeal","Blue Stripe","Pink"]', unitPrice: 28.0, moq: 12, stock: 120, imageUrl: "https://picsum.photos/seed/kd008/400/500", description: "Soft merino cardigan with wooden button fastening", popularity: 75 },
  // ACCESSORIES
  { sku: "AC-001", name: "Leather Belt — Classic Stitch", category: "Accessories", material: "Full-Grain Leather", colours: '["Tan","Black","Dark Brown"]', unitPrice: 28.0, moq: 12, stock: 144, imageUrl: "https://picsum.photos/seed/ac001/400/500", description: "Full-grain leather belt with single-pin buckle", popularity: 80 },
  { sku: "AC-002", name: "Wool Blend Scarf", category: "Accessories", material: "50% Wool 50% Acrylic", colours: '["Camel","Grey","Burgundy","Navy Plaid"]', unitPrice: 22.0, moq: 24, stock: 216, imageUrl: "https://picsum.photos/seed/ac002/400/500", description: "Soft wool blend scarf in classic plaid pattern", popularity: 77 },
  { sku: "AC-003", name: "Canvas Tote Bag", category: "Accessories", material: "100% Heavy Canvas", colours: '["Natural","Black","Navy"]', unitPrice: 14.0, moq: 36, stock: 480, imageUrl: "https://picsum.photos/seed/ac003/400/500", description: "Heavy-duty canvas tote with interior zip pocket", popularity: 84 },
  { sku: "AC-004", name: "Knitted Beanie Hat", category: "Accessories", material: "100% Merino Wool", colours: '["Charcoal","Oatmeal","Rust","Forest"]', unitPrice: 18.0, moq: 24, stock: 12, imageUrl: "https://picsum.photos/seed/ac004/400/500", description: "Fine-knit merino beanie with ribbed cuff", popularity: 82 },
  { sku: "AC-005", name: "Silk Pocket Square Set", category: "Accessories", material: "100% Silk", colours: '["Classic Paisley","Geometric","Solid Navy"]', unitPrice: 12.0, moq: 24, stock: 192, imageUrl: "https://picsum.photos/seed/ac005/400/500", description: "Set of 3 silk pocket squares in assorted patterns", popularity: 65 },
  { sku: "AC-006", name: "Leather Card Holder", category: "Accessories", material: "Vegetable-Tanned Leather", colours: '["Cognac","Black","Olive"]', unitPrice: 16.0, moq: 24, stock: 168, imageUrl: "https://picsum.photos/seed/ac006/400/500", description: "Slim 4-card slot leather cardholder", popularity: 71 },
  { sku: "AC-007", name: "Packable Sun Hat", category: "Accessories", material: "100% Paper Straw", colours: '["Natural","Black"]', unitPrice: 20.0, moq: 24, stock: 0, imageUrl: "https://picsum.photos/seed/ac007/400/500", description: "Wide-brim sun hat, packable for travel", popularity: 68 },
  { sku: "AC-008", name: "Striped Woven Tie", category: "Accessories", material: "100% Silk", colours: '["Navy/Gold","Burgundy/Silver","Grey/Blue"]', unitPrice: 24.0, moq: 12, stock: 96, imageUrl: "https://picsum.photos/seed/ac008/400/500", description: "Classic regimental stripe silk tie, hand-finished", popularity: 60 },
  { sku: "MN-013", name: "Performance Running Shorts", category: "Men", material: "88% Polyester 12% Elastane", colours: '["Black","Navy","Charcoal"]', unitPrice: 26.0, moq: 24, stock: 264, imageUrl: "https://picsum.photos/seed/mn013/400/500", description: "Moisture-wicking running shorts with liner and zip pocket", popularity: 85 },
  { sku: "WM-012", name: "High-Waist Yoga Leggings", category: "Women", material: "78% Polyester 22% Elastane", colours: '["Black","Midnight Navy","Forest Green","Plum"]', unitPrice: 34.0, moq: 24, stock: 312, imageUrl: "https://picsum.photos/seed/wm012/400/500", description: "Four-way stretch yoga leggings with hidden waistband pocket", popularity: 97 },
];

const statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Seed users
  const hashedPassword = await bcrypt.hash("demo1234", 10);

  // SUPERADMIN
  await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "superadmin@fashionwholesale.com",
      password: hashedPassword,
      role: "SUPERADMIN",
      company: "FashionWholesale Corp",
      phone: "+1 (555) 000-0000",
    },
  });

  // ADMIN
  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@fashionwholesale.com",
      password: hashedPassword,
      role: "ADMIN",
      company: "FashionWholesale Corp",
      phone: "+1 (555) 000-0001",
    },
  });

  // MANAGER
  await prisma.user.create({
    data: {
      name: "Morgan Lee",
      email: "manager@fashionwholesale.com",
      password: hashedPassword,
      role: "MANAGER",
      company: "FashionWholesale Corp",
      phone: "+1 (555) 000-0002",
    },
  });

  // USERS (buyers)
  const buyer1 = await prisma.user.create({
    data: {
      name: "Sarah Mitchell",
      email: "buyer@fashionwholesale.com",
      password: hashedPassword,
      role: "USER",
      company: "Mitchell Retail Group",
      phone: "+1 (555) 100-2345",
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      name: "James Thornton",
      email: "james@thorntonboutique.com",
      password: hashedPassword,
      role: "USER",
      company: "Thornton Boutique Ltd",
      phone: "+44 20 7946 0300",
    },
  });

  const buyer3 = await prisma.user.create({
    data: {
      name: "Elena Voss",
      email: "elena@nordstyleag.com",
      password: hashedPassword,
      role: "USER",
      company: "NordStyle AG",
      phone: "+49 30 12345678",
    },
  });

  console.log("Users seeded.");

  // Seed products
  const seededProducts = await Promise.all(
    products.map((p) => prisma.product.create({ data: p }))
  );

  console.log(`${seededProducts.length} products seeded.`);

  // Helper to get random date within last 60 days
  const randomDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
    return d;
  };

  const buyers = [buyer1, buyer2, buyer3];

  // Seed 28 orders
  const orderData = [
    { buyerIdx: 0, statusIdx: 3, daysAgo: 55, items: [{ pIdx: 0, qty: 48 }, { pIdx: 3, qty: 24 }] },
    { buyerIdx: 1, statusIdx: 3, daysAgo: 52, items: [{ pIdx: 12, qty: 24 }, { pIdx: 13, qty: 12 }] },
    { buyerIdx: 2, statusIdx: 3, daysAgo: 50, items: [{ pIdx: 20, qty: 48 }, { pIdx: 31, qty: 36 }] },
    { buyerIdx: 0, statusIdx: 3, daysAgo: 47, items: [{ pIdx: 8, qty: 24 }, { pIdx: 5, qty: 72 }] },
    { buyerIdx: 1, statusIdx: 2, daysAgo: 40, items: [{ pIdx: 14, qty: 12 }, { pIdx: 16, qty: 12 }] },
    { buyerIdx: 2, statusIdx: 2, daysAgo: 38, items: [{ pIdx: 22, qty: 24 }, { pIdx: 23, qty: 24 }] },
    { buyerIdx: 0, statusIdx: 2, daysAgo: 35, items: [{ pIdx: 1, qty: 24 }, { pIdx: 9, qty: 12 }] },
    { buyerIdx: 1, statusIdx: 3, daysAgo: 33, items: [{ pIdx: 15, qty: 12 }, { pIdx: 17, qty: 12 }] },
    { buyerIdx: 2, statusIdx: 1, daysAgo: 28, items: [{ pIdx: 24, qty: 12 }, { pIdx: 25, qty: 24 }] },
    { buyerIdx: 0, statusIdx: 3, daysAgo: 25, items: [{ pIdx: 2, qty: 12 }, { pIdx: 4, qty: 6 }] },
    { buyerIdx: 1, statusIdx: 2, daysAgo: 22, items: [{ pIdx: 18, qty: 12 }, { pIdx: 19, qty: 12 }] },
    { buyerIdx: 2, statusIdx: 1, daysAgo: 20, items: [{ pIdx: 27, qty: 24 }, { pIdx: 28, qty: 12 }] },
    { buyerIdx: 0, statusIdx: 1, daysAgo: 18, items: [{ pIdx: 6, qty: 6 }, { pIdx: 10, qty: 6 }] },
    { buyerIdx: 1, statusIdx: 0, daysAgo: 15, items: [{ pIdx: 12, qty: 12 }, { pIdx: 38, qty: 36 }] },
    { buyerIdx: 2, statusIdx: 0, daysAgo: 14, items: [{ pIdx: 29, qty: 24 }, { pIdx: 32, qty: 24 }] },
    { buyerIdx: 0, statusIdx: 0, daysAgo: 12, items: [{ pIdx: 11, qty: 24 }, { pIdx: 7, qty: 12 }] },
    { buyerIdx: 1, statusIdx: 2, daysAgo: 10, items: [{ pIdx: 21, qty: 12 }, { pIdx: 33, qty: 24 }] },
    { buyerIdx: 2, statusIdx: 0, daysAgo: 9, items: [{ pIdx: 34, qty: 24 }, { pIdx: 35, qty: 24 }] },
    { buyerIdx: 0, statusIdx: 1, daysAgo: 7, items: [{ pIdx: 0, qty: 24 }, { pIdx: 3, qty: 24 }] },
    { buyerIdx: 1, statusIdx: 0, daysAgo: 6, items: [{ pIdx: 13, qty: 12 }, { pIdx: 16, qty: 6 }] },
    { buyerIdx: 2, statusIdx: 4, daysAgo: 30, items: [{ pIdx: 26, qty: 12 }] },
    { buyerIdx: 0, statusIdx: 4, daysAgo: 45, items: [{ pIdx: 5, qty: 36 }] },
    { buyerIdx: 1, statusIdx: 1, daysAgo: 5, items: [{ pIdx: 15, qty: 12 }, { pIdx: 38, qty: 48 }] },
    { buyerIdx: 2, statusIdx: 0, daysAgo: 4, items: [{ pIdx: 30, qty: 12 }, { pIdx: 31, qty: 24 }] },
    { buyerIdx: 0, statusIdx: 0, daysAgo: 3, items: [{ pIdx: 8, qty: 48 }, { pIdx: 2, qty: 12 }] },
    { buyerIdx: 1, statusIdx: 0, daysAgo: 2, items: [{ pIdx: 37, qty: 12 }, { pIdx: 36, qty: 24 }] },
    { buyerIdx: 2, statusIdx: 1, daysAgo: 1, items: [{ pIdx: 39, qty: 24 }, { pIdx: 33, qty: 24 }] },
    { buyerIdx: 0, statusIdx: 0, daysAgo: 0, items: [{ pIdx: 4, qty: 6 }, { pIdx: 6, qty: 6 }] },
  ];

  const addresses = [
    { street: "123 Fashion Ave", city: "New York", state: "NY", zip: "10001", country: "USA" },
    { street: "45 Regent Street", city: "London", state: "England", zip: "W1B 5EH", country: "UK" },
    { street: "18 Kurfürstendamm", city: "Berlin", state: "Berlin", zip: "10719", country: "Germany" },
  ];

  let orderCount = 0;
  for (const od of orderData) {
    const buyer = buyers[od.buyerIdx];
    const status = statuses[od.statusIdx];
    const address = addresses[od.buyerIdx];

    const items = od.items
      .map(({ pIdx, qty }) => ({
        product: seededProducts[pIdx] ?? seededProducts[0],
        qty,
      }))
      .filter((i) => i.product);

    const totalAmount = items.reduce(
      (sum, i) => sum + i.product.unitPrice * i.qty,
      0
    );

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - od.daysAgo);
    createdAt.setHours(Math.floor(Math.random() * 8) + 8, Math.floor(Math.random() * 60));

    const ts = createdAt.getTime().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `FW-${ts}-${rand}`;

    await prisma.order.create({
      data: {
        orderNumber,
        status,
        totalAmount,
        shippingAddress: JSON.stringify(address),
        notes: Math.random() > 0.6 ? "Please include packing list with shipment." : null,
        userId: buyer.id,
        createdAt,
        updatedAt: createdAt,
        items: {
          create: items.map((i) => ({
            productId: i.product.id,
            quantity: i.qty,
            unitPrice: i.product.unitPrice,
          })),
        },
      },
    });
    orderCount++;
  }

  console.log(`${orderCount} orders seeded.`);
  console.log("Database seeding complete!");
  console.log("\nDemo accounts (all password: demo1234):");
  console.log("  Superadmin : superadmin@fashionwholesale.com");
  console.log("  Admin      : admin@fashionwholesale.com");
  console.log("  Manager    : manager@fashionwholesale.com");
  console.log("  User/Buyer : buyer@fashionwholesale.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
