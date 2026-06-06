import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import { isStaff } from "@/lib/roles";
import { z } from "zod";

const OrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
    })
  ).min(1),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().min(1),
    country: z.string().min(1),
  }),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const buyerId = searchParams.get("buyerId") || "";
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const where: any = {
    AND: [
      !isStaff(user.role) ? { userId: user.id } : {},
      buyerId && isStaff(user.role) ? { userId: buyerId } : {},
      status ? { status } : {},
      dateFrom ? { createdAt: { gte: new Date(dateFrom) } } : {},
      dateTo ? { createdAt: { lte: new Date(dateTo) } } : {},
    ],
  };

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, company: true } },
      items: { include: { product: { select: { id: true, name: true, sku: true, imageUrl: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const body = await req.json();
  const parsed = OrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { items, shippingAddress, notes } = parsed.data;
  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      status: "Pending",
      totalAmount,
      shippingAddress: JSON.stringify(shippingAddress),
      notes: notes || null,
      userId: user.id,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    include: {
      items: { include: { product: true } },
      user: { select: { name: true, email: true, company: true } },
    },
  });

  return NextResponse.json(order, { status: 201 });
}
