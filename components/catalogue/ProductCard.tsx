"use client";

import { motion } from "framer-motion";
import { StockBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  material: string;
  colours: string;
  unitPrice: number;
  moq: number;
  stock: number;
  imageUrl: string;
  description?: string | null;
}

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const colours = JSON.parse(product.colours) as string[];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow cursor-pointer group"
    >
      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <StockBadge stock={product.stock} />
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-sans text-[#6b7280]">
          {product.category}
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs text-[#6b7280] font-sans mb-1">{product.sku}</p>
        <h3 className="font-display text-lg font-medium text-[#1a1a2e] leading-tight mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-[#6b7280] font-sans mb-3">{product.material}</p>

        <div className="flex gap-1 mb-3">
          {colours.slice(0, 4).map((c) => (
            <span
              key={c}
              className="inline-block w-4 h-4 rounded-full border border-[#e5e3df] ring-1 ring-white"
              title={c}
              style={{ background: colourToHex(c) }}
            />
          ))}
          {colours.length > 4 && (
            <span className="text-xs text-[#6b7280] font-sans self-center ml-1">+{colours.length - 4}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="font-display text-xl font-semibold text-[#1a1a2e]">
            {formatCurrency(product.unitPrice)}
          </span>
          <span className="text-xs text-[#6b7280] font-sans">MOQ: {product.moq}</span>
        </div>
      </div>
    </motion.div>
  );
}

function colourToHex(name: string): string {
  const map: Record<string, string> = {
    White: "#ffffff", Black: "#1a1a1a", Navy: "#1e3459", Blue: "#3b82f6",
    "Sky Blue": "#7dd3fc", "Dark Blue": "#1e40af", "Mid Blue": "#3b82f6",
    Grey: "#9ca3af", "Grey Marl": "#9ca3af", Charcoal: "#374151", Slate: "#64748b",
    "Pale Pink": "#fbcfe8", Pink: "#ec4899", Blush: "#f9a8d4", Rose: "#fb7185",
    Red: "#ef4444", Burgundy: "#7f1d1d", "Deep Burgundy": "#7f1d1d", Wine: "#722f37",
    Camel: "#c19a6b", Tan: "#d2b48c", "Dark Brown": "#7c3f00", Cognac: "#9b4e2f",
    Cream: "#fef9ef", Ivory: "#fffff0", Oatmeal: "#f5f0e8", Natural: "#e8dcc8",
    Ecru: "#f5f0dc", Beige: "#f5f5dc", Stone: "#d6d3c4",
    Gold: "#c9a84c", "Gold Stripe": "#c9a84c",
    Green: "#22c55e", "Forest Green": "#166534", Forest: "#166534", Sage: "#86a686", Olive: "#6b7c5e", Teal: "#0d9488",
    Khaki: "#c3b091", Mint: "#a7f3d0",
    Yellow: "#fbbf24", Orange: "#f97316", Rust: "#c2410c", Terracotta: "#c2410c",
    Lavender: "#c4b5fd", Cobalt: "#2563eb", Plum: "#7e22ce",
    "Chocolate": "#7c3f00", Caramel: "#d2691e", Champagne: "#f7e7ce",
    "Denim Blue": "#4169e1", "Check": "#888888", "Floral Multi": "#ff6b9d",
    "Black Floral": "#222222", "Houndstooth": "#555555", "Mixed Pack": "#aaaaaa",
    "Floral Print": "#ff6b9d", "Star Print": "#6b7280", "Dino Print": "#22c55e",
    "Stripe": "#3b82f6", "Navy Plaid": "#1e3459", "Navy/Gold": "#1e3459",
    "Burgundy/Silver": "#7f1d1d", "Grey/Blue": "#64748b",
    "Classic Paisley": "#6b21a8", Geometric: "#0284c7", "Solid Navy": "#1e3459",
  };
  return map[name] || "#d1d5db";
}
