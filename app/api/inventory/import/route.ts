import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CAN } from "@/lib/roles";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || !CAN.manageInventory(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const text = await req.text();
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) {
    return NextResponse.json({ error: "Empty or invalid CSV" }, { status: 400 });
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const results = { created: 0, updated: 0, errors: 0 };

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => (row[h] = values[idx] || ""));

    if (!row.sku || !row.name) {
      results.errors++;
      continue;
    }

    try {
      const data = {
        name: row.name,
        category: row.category || "Men",
        material: row.material || "",
        colours: row.colours || '["Black"]',
        unitPrice: parseFloat(row.unitprice || row["unit price"] || "0"),
        moq: parseInt(row.moq || "12"),
        stock: parseInt(row.stock || "0"),
        imageUrl: row.imageurl || row["image url"] || `https://picsum.photos/seed/${row.sku}/400/500`,
        description: row.description || "",
      };

      const existing = await prisma.product.findUnique({ where: { sku: row.sku } });
      if (existing) {
        await prisma.product.update({ where: { sku: row.sku }, data });
        results.updated++;
      } else {
        await prisma.product.create({ data: { ...data, sku: row.sku } });
        results.created++;
      }
    } catch {
      results.errors++;
    }
  }

  return NextResponse.json({ success: true, ...results });
}
