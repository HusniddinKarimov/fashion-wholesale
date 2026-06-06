"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StockBadge } from "@/components/ui/Badge";
import { Trash2, Plus, Minus, ShoppingBag, CheckCircle, Search } from "lucide-react";
import { z } from "zod";

interface Product {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  moq: number;
  stock: number;
  imageUrl: string;
  category: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const AddressSchema = z.object({
  street: z.string().min(1, "Street required"),
  city: z.string().min(1, "City required"),
  state: z.string().min(1, "State required"),
  zip: z.string().min(1, "ZIP required"),
  country: z.string().min(1, "Country required"),
});

function NewOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedId = searchParams.get("product");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [address, setAddress] = useState({ street: "", city: "", state: "", zip: "", country: "" });
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products?sort=newest")
      .then((r) => r.json())
      .then((data: Product[]) => {
        setProducts(data);
        if (preselectedId) {
          const p = data.find((p) => p.id === preselectedId);
          if (p) addToCart(p);
        }
      });
  }, [preselectedId]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.product.id === product.id);
      if (exists) return prev;
      return [...prev, { product, quantity: product.moq }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        const newQty = Math.max(item.product.moq, item.quantity + delta);
        return { ...item, quantity: newQty };
      })
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const total = cart.reduce((s, i) => s + i.product.unitPrice * i.quantity, 0);

  const filteredProducts = products.filter(
    (p) =>
      !cart.find((c) => c.product.id === p.id) &&
      p.stock > 0 &&
      (productSearch === "" ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = AddressSchema.safeParse(address);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      return;
    }
    if (cart.length === 0) {
      setErrors({ cart: "Add at least one product to your order." });
      return;
    }
    setErrors({});
    setSubmitting(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          unitPrice: i.product.unitPrice,
        })),
        shippingAddress: address,
        notes: notes || undefined,
      }),
    });

    setSubmitting(false);
    if (res.ok) {
      const order = await res.json();
      setConfirmed(order.orderNumber);
    }
  };

  if (confirmed) {
    return (
      <div className="max-w-lg mx-auto py-24 text-center">
        <CheckCircle size={56} className="text-emerald-500 mx-auto mb-6" />
        <h1 className="font-display text-4xl font-semibold text-[#1a1a2e] mb-2">Order Placed!</h1>
        <p className="text-[#6b7280] font-sans mb-4">Your order number is</p>
        <div className="inline-block bg-[#fafaf9] border border-[#e5e3df] rounded-xl px-6 py-3 mb-8">
          <span className="font-display text-2xl font-bold text-[#2d4a7a]">{confirmed}</span>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => router.push("/orders")}>View My Orders</Button>
          <Button variant="secondary" onClick={() => router.push("/catalogue")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-[#1a1a2e] mb-1">New Order</h1>
        <p className="text-[#6b7280] font-sans">Build your wholesale order below</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: product picker + cart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product search */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="font-display text-xl font-semibold text-[#1a1a2e] mb-4">Add Products</h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" size={15} />
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full h-9 pl-8 pr-3 border border-[#e5e3df] rounded-md text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#2d4a7a]"
                />
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {filteredProducts.slice(0, 20).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-[#e5e3df]"
                    onClick={() => addToCart(p)}
                  >
                    <img src={p.imageUrl} alt="" className="w-10 h-12 object-cover rounded-md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm font-medium text-[#1a1a2e] truncate">{p.name}</p>
                      <p className="font-sans text-xs text-[#6b7280]">{p.sku} · MOQ {p.moq}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-sans text-sm font-semibold text-[#1a1a2e]">{formatCurrency(p.unitPrice)}</p>
                      <StockBadge stock={p.stock} />
                    </div>
                    <Plus size={18} className="text-[#2d4a7a] shrink-0" />
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <p className="text-sm text-[#6b7280] font-sans text-center py-4">No available products found</p>
                )}
              </div>
            </div>

            {/* Cart */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="font-display text-xl font-semibold text-[#1a1a2e] mb-4">
                Order Items <span className="text-[#6b7280] font-sans text-base font-normal">({cart.length})</span>
              </h2>
              {errors.cart && <p className="text-sm text-red-500 font-sans mb-3">{errors.cart}</p>}
              {cart.length === 0 ? (
                <div className="py-10 text-center text-[#6b7280] font-sans">
                  <ShoppingBag size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No items added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 p-3 bg-[#fafaf9] rounded-lg border border-[#e5e3df]">
                      <img src={item.product.imageUrl} alt="" className="w-12 h-14 object-cover rounded-md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm font-medium text-[#1a1a2e] truncate">{item.product.name}</p>
                        <p className="font-sans text-xs text-[#6b7280]">MOQ: {item.product.moq} units</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => updateQty(item.product.id, -item.product.moq)} className="w-7 h-7 rounded-full border border-[#e5e3df] flex items-center justify-center hover:bg-gray-100">
                          <Minus size={12} />
                        </button>
                        <span className="w-10 text-center font-sans text-sm font-medium">{item.quantity}</span>
                        <button type="button" onClick={() => updateQty(item.product.id, item.product.moq)} className="w-7 h-7 rounded-full border border-[#e5e3df] flex items-center justify-center hover:bg-gray-100">
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="font-sans text-sm font-semibold text-[#1a1a2e] w-20 text-right">
                        {formatCurrency(item.product.unitPrice * item.quantity)}
                      </span>
                      <button type="button" onClick={() => removeItem(item.product.id)} className="text-[#6b7280] hover:text-red-500 transition-colors p-1">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order notes */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="font-display text-xl font-semibold text-[#1a1a2e] mb-4">Order Notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions, packing notes, etc."
                rows={3}
                className="w-full border border-[#e5e3df] rounded-md px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#2d4a7a] resize-none"
              />
            </div>
          </div>

          {/* Right: shipping + summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="font-display text-xl font-semibold text-[#1a1a2e] mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <Input label="Street Address" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} error={errors.street} placeholder="123 Main Street" />
                <Input label="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} error={errors.city} placeholder="New York" />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="State / Province" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} error={errors.state} placeholder="NY" />
                  <Input label="ZIP / Postcode" value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} error={errors.zip} placeholder="10001" />
                </div>
                <Input label="Country" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} error={errors.country} placeholder="United States" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-card p-6 sticky top-24">
              <h2 className="font-display text-xl font-semibold text-[#1a1a2e] mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm font-sans">
                    <span className="text-[#6b7280] truncate flex-1">{item.product.name} ×{item.quantity}</span>
                    <span className="text-[#1a1a2e] font-medium ml-2">{formatCurrency(item.product.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#e5e3df] pt-3 flex justify-between items-center mb-6">
                <span className="font-sans font-semibold text-[#1a1a2e]">Total</span>
                <span className="font-display text-2xl font-bold text-[#1a1a2e]">{formatCurrency(total)}</span>
              </div>
              <Button type="submit" loading={submitting} className="w-full" size="lg">
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-[#6b7280] font-sans">Loading...</div>}>
      <NewOrderContent />
    </Suspense>
  );
}
