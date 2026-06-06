import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isStaff } from "@/lib/roles";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || !isStaff(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    monthOrders,
    activeBuilders,
    lowStockItems,
    allOrders,
    last30dOrders,
    _categoryOrders,
    statusBreakdown,
  ] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: startOfMonth }, status: { not: "Cancelled" } },
      select: { totalAmount: true },
    }),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.product.count({ where: { stock: { gt: 0, lt: 50 } } }),
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, status: { not: "Cancelled" } },
      include: { items: { include: { product: { select: { category: true } } } } },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { items: { include: { product: { select: { category: true } } } }, totalAmount: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
  ]);

  // Orders per day for the last 30 days
  const dayMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayMap.set(d.toISOString().split("T")[0], 0);
  }
  allOrders.forEach((o) => {
    const day = o.createdAt.toISOString().split("T")[0];
    if (dayMap.has(day)) dayMap.set(day, (dayMap.get(day) || 0) + 1);
  });
  const ordersPerDay = Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }));

  // Revenue by category
  const revenueByCategory: Record<string, number> = {};
  last30dOrders.forEach((order) => {
    order.items.forEach((item: any) => {
      const cat = item.product?.category || "Other";
      revenueByCategory[cat] = (revenueByCategory[cat] || 0) + item.quantity * item.unitPrice;
    });
  });
  const revenueChart = Object.entries(revenueByCategory).map(([category, revenue]) => ({
    category,
    revenue: Math.round(revenue * 100) / 100,
  }));

  // Status breakdown
  const statusChart = statusBreakdown.map((s) => ({
    status: s.status,
    count: s._count._all,
  }));

  return NextResponse.json({
    kpis: {
      totalOrdersMonth: monthOrders.length,
      revenueMonth: monthOrders.reduce((s, o) => s + o.totalAmount, 0),
      activeBuyers: activeBuilders,
      lowStockItems,
    },
    ordersPerDay,
    revenueByCategory: revenueChart,
    statusBreakdown: statusChart,
  });
}
