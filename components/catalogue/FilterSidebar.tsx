"use client";

import { X } from "lucide-react";

interface Filters {
  category: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  colour: string;
}

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const CATEGORIES = ["", "Men", "Women", "Kids", "Accessories"];
const COLOURS = ["", "White", "Black", "Navy", "Blue", "Grey", "Beige", "Cream", "Camel", "Red", "Burgundy", "Green", "Olive", "Pink", "Yellow", "Orange"];

export function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  const reset = () =>
    onChange({ category: "", minPrice: 0, maxPrice: 500, inStock: false, colour: "" });

  const hasFilters =
    filters.category || filters.inStock || filters.colour || filters.minPrice > 0 || filters.maxPrice < 500;

  return (
    <aside className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-[#1a1a2e]">Filters</h3>
        {hasFilters && (
          <button
            onClick={reset}
            className="text-xs text-[#6b7280] hover:text-[#1a1a2e] font-sans flex items-center gap-1 transition-colors"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <p className="text-sm font-medium text-[#1a1a2e] font-sans mb-2">Category</p>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat || "all"}
              onClick={() => set("category", cat)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-sans transition-colors ${
                filters.category === cat
                  ? "bg-[#2d4a7a] text-white"
                  : "text-[#6b7280] hover:bg-gray-100 hover:text-[#1a1a2e]"
              }`}
            >
              {cat || "All Categories"}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-sm font-medium text-[#1a1a2e] font-sans mb-2">
          Price — ${filters.minPrice} to ${filters.maxPrice}
        </p>
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={200}
            value={filters.minPrice}
            onChange={(e) => set("minPrice", Number(e.target.value))}
            className="w-full accent-[#2d4a7a]"
          />
          <input
            type="range"
            min={0}
            max={500}
            value={filters.maxPrice}
            onChange={(e) => set("maxPrice", Number(e.target.value))}
            className="w-full accent-[#2d4a7a]"
          />
        </div>
      </div>

      {/* In Stock only */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => set("inStock", !filters.inStock)}
            className={`w-10 h-5 rounded-full transition-colors relative ${
              filters.inStock ? "bg-[#2d4a7a]" : "bg-gray-200"
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                filters.inStock ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-sm font-sans text-[#1a1a2e]">In Stock Only</span>
        </label>
      </div>

      {/* Colour */}
      <div>
        <p className="text-sm font-medium text-[#1a1a2e] font-sans mb-2">Colour</p>
        <select
          value={filters.colour}
          onChange={(e) => set("colour", e.target.value)}
          className="w-full h-9 border border-[#e5e3df] rounded-md px-2 text-sm font-sans text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#2d4a7a]"
        >
          {COLOURS.map((c) => (
            <option key={c || "all"} value={c}>
              {c || "Any Colour"}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
