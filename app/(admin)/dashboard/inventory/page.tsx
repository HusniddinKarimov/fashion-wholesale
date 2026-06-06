"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StockBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Plus, Download, Upload, Trash2, Edit2, Check, X } from "lucide-react";
import { TableRowSkeleton } from "@/components/ui/Skeleton";

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
  updatedAt: string;
}

const CATEGORIES = ["Men", "Women", "Kids", "Accessories"];

const EMPTY_FORM = {
  sku: "", name: "", category: "Men", material: "", colours: '["Black"]',
  unitPrice: "", moq: "12", stock: "0", imageUrl: "", description: "",
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [inlineEdit, setInlineEdit] = useState<string | null>(null);
  const [inlineValues, setInlineValues] = useState<Record<string, { stock: string; unitPrice: string }>>({});
  const [importMsg, setImportMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    setProducts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        unitPrice: parseFloat(form.unitPrice),
        moq: parseInt(form.moq),
        stock: parseInt(form.stock),
      }),
    });
    setSaving(false);
    setAddOpen(false);
    setForm(EMPTY_FORM);
    fetchProducts();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/products?id=${deleteTarget.id}`, { method: "DELETE" });
    setDeleteTarget(null);
    fetchProducts();
  };

  const startInline = (p: Product) => {
    setInlineEdit(p.id);
    setInlineValues((prev) => ({
      ...prev,
      [p.id]: { stock: String(p.stock), unitPrice: String(p.unitPrice) },
    }));
  };

  const saveInline = async (p: Product) => {
    const vals = inlineValues[p.id];
    await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: p.id,
        stock: parseInt(vals.stock),
        unitPrice: parseFloat(vals.unitPrice),
      }),
    });
    setInlineEdit(null);
    fetchProducts();
  };

  const handleExport = () => {
    const headers = ["SKU", "Name", "Category", "Material", "Colours", "Unit Price", "MOQ", "Stock", "Image URL", "Description"];
    const rows = products.map((p) =>
      [p.sku, p.name, p.category, p.material, p.colours, p.unitPrice, p.moq, p.stock, p.imageUrl, p.description || ""].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = await fetch("/api/inventory/import", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: text,
    });
    const data = await res.json();
    setImportMsg(`Imported: ${data.created} created, ${data.updated} updated, ${data.errors} errors`);
    fetchProducts();
    if (fileRef.current) fileRef.current.value = "";
    setTimeout(() => setImportMsg(""), 5000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold text-[#1a1a2e] mb-1">Inventory</h1>
          <p className="text-[#6b7280] font-sans">Manage product stock, pricing, and catalogue</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download size={14} /> Export CSV
          </Button>
          <label className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium border border-[#e5e3df] rounded-md hover:bg-gray-50 cursor-pointer text-[#6b7280] transition-colors font-sans">
            <Upload size={14} /> Import CSV
            <input type="file" accept=".csv" ref={fileRef} className="hidden" onChange={handleImport} />
          </label>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> Add Product
          </Button>
        </div>
      </div>

      {importMsg && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-sans rounded-md px-4 py-3">
          {importMsg}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-card border border-[#e5e3df] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-[#e5e3df]">
                {["SKU", "Name", "Category", "Stock", "MOQ", "Unit Price", "Last Updated", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#6b7280] font-sans uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e3df]">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={9} />)
                : products.map((p) => {
                  const editing = inlineEdit === p.id;
                  const vals = inlineValues[p.id] || { stock: String(p.stock), unitPrice: String(p.unitPrice) };
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs font-mono text-[#6b7280]">{p.sku}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <img src={p.imageUrl} alt="" className="w-8 h-10 object-cover rounded" />
                          <span className="text-sm font-sans font-medium text-[#1a1a2e] max-w-[160px] truncate">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-sans text-[#6b7280]">{p.category}</td>
                      <td className="px-4 py-3">
                        {editing ? (
                          <input
                            type="number"
                            min={0}
                            value={vals.stock}
                            onChange={(e) => setInlineValues((prev) => ({ ...prev, [p.id]: { ...vals, stock: e.target.value } }))}
                            className="w-20 h-8 border border-[#2d4a7a] rounded px-2 text-sm font-sans focus:outline-none"
                          />
                        ) : (
                          <span className="text-sm font-sans">{p.stock}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-sans text-[#6b7280]">{p.moq}</td>
                      <td className="px-4 py-3">
                        {editing ? (
                          <input
                            type="number"
                            step={0.01}
                            min={0}
                            value={vals.unitPrice}
                            onChange={(e) => setInlineValues((prev) => ({ ...prev, [p.id]: { ...vals, unitPrice: e.target.value } }))}
                            className="w-24 h-8 border border-[#2d4a7a] rounded px-2 text-sm font-sans focus:outline-none"
                          />
                        ) : (
                          <span className="text-sm font-sans font-medium">{formatCurrency(p.unitPrice)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs font-sans text-[#6b7280] whitespace-nowrap">
                        {formatDate(p.updatedAt)}
                      </td>
                      <td className="px-4 py-3"><StockBadge stock={p.stock} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {editing ? (
                            <>
                              <button onClick={() => saveInline(p)} className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                                <Check size={14} />
                              </button>
                              <button onClick={() => setInlineEdit(null)} className="p-1.5 rounded-md hover:bg-gray-100 text-[#6b7280] transition-colors">
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startInline(p)} className="p-1.5 rounded-md hover:bg-blue-50 text-[#6b7280] hover:text-[#2d4a7a] transition-colors">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-md hover:bg-red-50 text-[#6b7280] hover:text-red-500 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add product modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Product" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="SKU *" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required placeholder="MN-099" />
            <Select label="Category *" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
          </div>
          <Input label="Product Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Classic Oxford Shirt" />
          <Input label="Material *" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} required placeholder="100% Cotton" />
          <Input label='Colours (JSON array) *' value={form.colours} onChange={(e) => setForm({ ...form, colours: e.target.value })} required placeholder='["White","Black","Navy"]' />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Unit Price ($) *" type="number" step={0.01} min={0} value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} required placeholder="29.99" />
            <Input label="MOQ *" type="number" min={1} value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value })} required placeholder="12" />
            <Input label="Stock *" type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required placeholder="100" />
          </div>
          <Input label="Image URL *" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required placeholder="https://picsum.photos/seed/xyz/400/500" />
          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] font-sans mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full border border-[#e5e3df] rounded-md px-3 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#2d4a7a] resize-none"
              placeholder="Optional product description"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving} className="flex-1">Add Product</Button>
            <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product" size="sm">
        <p className="text-sm text-[#6b7280] font-sans mb-6">
          Are you sure you want to delete <strong className="text-[#1a1a2e]">{deleteTarget?.name}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={handleDelete} className="flex-1">Delete</Button>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
