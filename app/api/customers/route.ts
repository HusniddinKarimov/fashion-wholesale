import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CAN } from "@/lib/roles";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || !CAN.manageCustomers(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const buyers = await prisma.user.findMany({
    where: {
      role: "USER",
      OR: search
        ? [
            { name: { contains: search } },
            { email: { contains: search } },
            { company: { contains: search } },
          ]
        : undefined,
    },
    include: {
      orders: {
        select: { totalAmount: true, createdAt: true, status: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const enriched = buyers.map((b) => ({
    id: b.id,
    name: b.name,
    email: b.email,
    company: b.company,
    phone: b.phone,
    createdAt: b.createdAt,
    totalOrders: b.orders.length,
    totalSpend: b.orders.reduce((s, o) => s + o.totalAmount, 0),
    lastOrderDate: b.orders[0]?.createdAt ?? null,
  }));

  return NextResponse.json(enriched);
}
