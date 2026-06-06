"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { ProductModal } from "@/components/catalogue/ProductModal";
import { FilterSidebar } from "@/components/catalogue/FilterSidebar";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { useDebounce } from "@/lib/hooks";

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

interface Filters {
  category: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  colour: string;
}

const DEFAULT_FILTERS: Filters = {
  category: "",
  minPrice: 0,
  maxPrice: 500,
  inStock: false,
  colour: "",
};

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<Product | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      search: debouncedSearch,
      category: filters.category,
      minPrice: String(filters.minPrice),
      maxPrice: String(filters.maxPrice),
      inStock: String(filters.inStock),
      colour: filters.colour,
      sort,
    });
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }, [debouncedSearch, filters, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-[#1a1a2e] mb-1">
          Product Catalogue
        </h1>
        <p className="text-[#6b7280] font-sans">Browse our full wholesale collection</p>
      </div>

      {/* Search + Sort bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, SKUs, materials..."
            className="w-full h-10 pl-9 pr-4 border border-[#e5e3df] rounded-md text-sm font-sans bg-white focus:outline-none focus:ring-2 focus:ring-[#2d4a7a] focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#1a1a2e]"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-10 border border-[#e5e3df] rounded-md px-3 text-sm font-sans bg-white focus:outline-none focus:ring-2 focus:ring-[#2d4a7a] cursor-pointer"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden h-10 px-3 border border-[#e5e3df] rounded-md text-[#6b7280] hover:bg-gray-50 flex items-center gap-2 text-sm font-sans"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar - desktop */}
        <div className="hidden lg:block w-56 shrink-0">
          <FilterSidebar filters={filters} onChange={setFilters} />
        </div>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="relative bg-white w-72 p-6 overflow-y-auto ml-auto shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <span className="font-display text-lg font-semibold">Filters</span>
                <button onClick={() => setSidebarOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <FilterSidebar filters={filters} onChange={setFilters} />
            </div>
          </div>
        )}

        {/* Product grid */}
        <div className="flex-1">
          {!loading && (
            <p className="text-sm text-[#6b7280] font-sans mb-4">
              {products.length} {products.length === 1 ? "product" : "products"} found
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 text-[#6b7280] font-sans">
              <Search size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">No products found</p>
              <p className="text-sm">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => setSelected(product)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
