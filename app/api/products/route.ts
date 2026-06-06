import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CAN } from "@/lib/roles";
import { z } from "zod";

const ProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(["Men", "Women", "Kids", "Accessories"]),
  material: z.string().min(1),
  colours: z.string(),
  unitPrice: z.number().positive(),
  moq: z.number().int().positive(),
  stock: z.number().int().min(0),
  imageUrl: z.string().url(),
  description: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const minPrice = parseFloat(searchParams.get("minPrice") || "0");
  const maxPrice = parseFloat(searchParams.get("maxPrice") || "9999");
  const inStock = searchParams.get("inStock") === "true";
  const colour = searchParams.get("colour") || "";
  const sort = searchParams.get("sort") || "newest";

  const where: any = {
    AND: [
      search ? { name: { contains: search } } : {},
      category ? { category } : {},
      { unitPrice: { gte: minPrice, lte: maxPrice } },
      inStock ? { stock: { gt: 0 } } : {},
      colour ? { colours: { contains: colour } } : {},
    ],
  };

  const orderBy: any =
    sort === "price-asc"
      ? { unitPrice: "asc" }
      : sort === "price-desc"
      ? { unitPrice: "desc" }
      : sort === "popular"
      ? { popularity: "desc" }
      : { createdAt: "desc" };

  const products = await prisma.product.findMany({ where, orderBy });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || !CAN.manageInventory(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = ProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const product = await prisma.product.create({ data: parsed.data });
  return NextResponse.json(product, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || !CAN.manageInventory(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const product = await prisma.product.update({ where: { id }, data });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || !CAN.deleteProduct(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
