"use client";

import { useEffect, useState, useCallback } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ChevronRight, Filter } from "lucide-react";
import { TableRowSkeleton } from "@/components/ui/Skeleton";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: { name: string; sku: string; imageUrl: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  notes?: string | null;
  createdAt: string;
  user: { name: string; email: string; company: string | null };
  items: OrderItem[];
}

const STATUSES = ["", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [detail, setDetail] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (filterDateFrom) params.set("dateFrom", filterDateFrom);
    if (filterDateTo) params.set("dateTo", filterDateTo);
    const res = await fetch(`/api/orders?${params}`);
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  }, [filterStatus, filterDateFrom, filterDateTo]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    if (detail?.id === orderId) {
      setDetail((prev) => prev ? { ...prev, status } : null);
    }
    fetchOrders();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-[#1a1a2e] mb-1">All Orders</h1>
        <p className="text-[#6b7280] font-sans">Manage and track all buyer orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-card border border-[#e5e3df] p-4 mb-6 flex flex-wrap gap-3 items-center">
        <Filter size={15} className="text-[#6b7280]" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 border border-[#e5e3df] rounded-md px-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#2d4a7a] cursor-pointer"
        >
          {STATUSES.map((s) => (
            <option key={s || "all"} value={s}>{s || "All Statuses"}</option>
          ))}
        </select>
        <input
          type="date"
          value={filterDateFrom}
          onChange={(e) => setFilterDateFrom(e.target.value)}
          className="h-9 border border-[#e5e3df] rounded-md px-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#2d4a7a]"
        />
        <span className="text-[#6b7280] font-sans text-sm">to</span>
        <input
          type="date"
          value={filterDateTo}
          onChange={(e) => setFilterDateTo(e.target.value)}
          className="h-9 border border-[#e5e3df] rounded-md px-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#2d4a7a]"
        />
        {(filterStatus || filterDateFrom || filterDateTo) && (
          <button
            onClick={() => { setFilterStatus(""); setFilterDateFrom(""); setFilterDateTo(""); }}
            className="text-xs text-[#6b7280] hover:text-[#1a1a2e] font-sans transition-colors"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto text-xs text-[#6b7280] font-sans">{orders.length} orders</span>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-[#e5e3df] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-[#e5e3df]">
                {["Order #", "Buyer", "Company", "Items", "Total", "Status", "Date", "Action", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#6b7280] font-sans uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e3df]">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={9} />)
                : orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-sans font-medium text-[#2d4a7a] whitespace-nowrap">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-sm font-sans text-[#1a1a2e]">{order.user.name}</td>
                    <td className="px-4 py-3 text-sm font-sans text-[#6b7280]">{order.user.company || "—"}</td>
                    <td className="px-4 py-3 text-sm font-sans text-center">{order.items.length}</td>
                    <td className="px-4 py-3 text-sm font-sans font-semibold text-[#1a1a2e] whitespace-nowrap">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-sm font-sans text-[#6b7280] whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        disabled={updating === order.id}
                        className="text-xs border border-[#e5e3df] rounded-md px-2 py-1 font-sans focus:outline-none focus:ring-1 focus:ring-[#2d4a7a] cursor-pointer disabled:opacity-50"
                      >
                        {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 cursor-pointer text-[#6b7280]" onClick={() => setDetail(order)}>
                      <ChevronRight size={16} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `Order ${detail.orderNumber}` : ""}
        size="lg"
      >
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusBadge status={detail.status} />
                <span className="text-sm text-[#6b7280] font-sans">{formatDate(detail.createdAt)}</span>
              </div>
              <div>
                <select
                  value={detail.status}
                  onChange={(e) => updateStatus(detail.id, e.target.value)}
                  className="text-sm border border-[#e5e3df] rounded-md px-3 py-1.5 font-sans focus:outline-none focus:ring-2 focus:ring-[#2d4a7a]"
                >
                  {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-[#fafaf9] rounded-lg p-4 border border-[#e5e3df]">
              <p className="text-sm font-medium text-[#1a1a2e] font-sans">{detail.user.name}</p>
              <p className="text-xs text-[#6b7280] font-sans">{detail.user.company} · {detail.user.email}</p>
            </div>

            <div className="space-y-2">
              {detail.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-[#fafaf9] rounded-lg border border-[#e5e3df]">
                  <img src={item.product.imageUrl} alt="" className="w-12 h-14 object-cover rounded-md" />
                  <div className="flex-1">
                    <p className="font-sans text-sm font-medium text-[#1a1a2e]">{item.product.name}</p>
                    <p className="font-sans text-xs text-[#6b7280]">{item.product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-sm font-semibold">{formatCurrency(item.unitPrice * item.quantity)}</p>
                    <p className="font-sans text-xs text-[#6b7280]">×{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#e5e3df] pt-4 flex justify-between">
              <span className="font-sans font-medium">Total</span>
              <span className="font-display text-2xl font-bold">{formatCurrency(detail.totalAmount)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
