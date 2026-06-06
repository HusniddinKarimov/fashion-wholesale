import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isStaff, CAN } from "@/lib/roles";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, email: true, company: true } },
      items: { include: { product: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = session.user as any;
  if (!isStaff(user.role) && order.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || !CAN.manageOrders(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status } = await req.json();
  const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data: { status },
    include: {
      user: { select: { name: true, email: true, company: true } },
      items: { include: { product: true } },
    },
  });

  return NextResponse.json(order);
}
