"use client";

import { Modal } from "@/components/ui/Modal";
import { StockBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, Package } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

function colourToHex(name: string): string {
  const map: Record<string, string> = {
    White: "#ffffff", Black: "#1a1a1a", Navy: "#1e3459", Blue: "#3b82f6",
    "Sky Blue": "#7dd3fc", "Dark Blue": "#1e40af", "Mid Blue": "#3b82f6",
    Grey: "#9ca3af", "Grey Marl": "#9ca3af", Charcoal: "#374151", Slate: "#64748b",
    "Pale Pink": "#fbcfe8", Pink: "#ec4899", Blush: "#f9a8d4", Rose: "#fb7185",
    Red: "#ef4444", Burgundy: "#7f1d1d", "Deep Burgundy": "#7f1d1d",
    Camel: "#c19a6b", Tan: "#d2b48c", Cognac: "#9b4e2f", Cream: "#fef9ef",
    Ivory: "#fffff0", Oatmeal: "#f5f0e8", Natural: "#e8dcc8", Ecru: "#f5f0dc",
    Beige: "#f5f5dc", Stone: "#d6d3c4", Gold: "#c9a84c",
    "Forest Green": "#166534", Forest: "#166534", Sage: "#86a686", Olive: "#6b7c5e",
    Teal: "#0d9488", Khaki: "#c3b091", Yellow: "#fbbf24", Orange: "#f97316",
    Rust: "#c2410c", Terracotta: "#c2410c", Lavender: "#c4b5fd", Cobalt: "#2563eb",
    Plum: "#7e22ce", Chocolate: "#7c3f00", Caramel: "#d2691e", Champagne: "#f7e7ce",
    "Denim Blue": "#4169e1", "Floral Multi": "#ff6b9d",
  };
  return map[name] || "#d1d5db";
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const router = useRouter();
  const [selectedColour, setSelectedColour] = useState(0);

  if (!product) return null;

  const colours = JSON.parse(product.colours) as string[];

  const handleAddToOrder = () => {
    router.push(`/orders/new?product=${product.id}`);
    onClose();
  };

  return (
    <Modal open={!!product} onClose={onClose} size="xl">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-sans text-[#6b7280] bg-gray-100 px-2 py-0.5 rounded-full">
                {product.category}
              </span>
              <span className="text-xs font-sans text-[#6b7280]">{product.sku}</span>
            </div>
            <h2 className="font-display text-3xl font-semibold text-[#1a1a2e] mb-1">
              {product.name}
            </h2>
            <p className="text-[#6b7280] font-sans text-sm">{product.material}</p>
          </div>

          <StockBadge stock={product.stock} />

          {product.description && (
            <p className="text-[#6b7280] font-sans text-sm leading-relaxed border-t border-[#e5e3df] pt-4">
              {product.description}
            </p>
          )}

          {/* Colour swatches */}
          <div>
            <p className="text-sm font-medium text-[#1a1a2e] font-sans mb-2">
              Colours — <span className="text-[#6b7280]">{colours[selectedColour]}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {colours.map((c, i) => (
                <button
                  key={c}
                  onClick={() => setSelectedColour(i)}
                  title={c}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    i === selectedColour
                      ? "border-[#2d4a7a] scale-110"
                      : "border-[#e5e3df] hover:border-gray-400"
                  }`}
                  style={{ background: colourToHex(c) }}
                />
              ))}
            </div>
          </div>

          {/* Pricing & MOQ */}
          <div className="bg-[#fafaf9] rounded-xl p-4 border border-[#e5e3df] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6b7280] font-sans">Unit Price</span>
              <span className="font-display text-2xl font-semibold text-[#1a1a2e]">
                {formatCurrency(product.unitPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6b7280] font-sans flex items-center gap-1">
                <Package size={13} /> Min. Order Qty
              </span>
              <span className="font-sans font-semibold text-[#1a1a2e]">{product.moq} units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6b7280] font-sans">Stock</span>
              <span className="font-sans font-semibold text-[#1a1a2e]">{product.stock} units</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleAddToOrder}
              disabled={product.stock === 0}
              className="flex-1"
              size="lg"
            >
              <ShoppingBag size={16} />
              {product.stock === 0 ? "Out of Stock" : "Add to Order"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
