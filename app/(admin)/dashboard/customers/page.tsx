"use client";

import { useEffect, useState, useCallback } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/Badge";
import { Search, ChevronRight, Users } from "lucide-react";
import { TableRowSkeleton } from "@/components/ui/Skeleton";

interface Customer {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  createdAt: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate: string | null;
}

interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  createdAt: string;
  totalOrders: number;
  totalSpend: number;
  orders: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    items: { quantity: number; product: { name: string } }[];
  }[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await fetch(`/api/customers${params}`);
    setCustomers(await res.json());
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const openDetail = async (id: string) => {
    setLoadingDetail(true);
    const res = await fetch(`/api/customers/${id}`);
    setDetail(await res.json());
    setLoadingDetail(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-[#1a1a2e] mb-1">Customers</h1>
        <p className="text-[#6b7280] font-sans">CRM — all registered wholesale buyers</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, company, or email..."
          className="w-full h-10 pl-9 pr-4 border border-[#e5e3df] rounded-md text-sm font-sans bg-white focus:outline-none focus:ring-2 focus:ring-[#2d4a7a]"
        />
      </div>

      <div className="bg-white rounded-xl shadow-card border border-[#e5e3df] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-[#e5e3df]">
                {["Name", "Company", "Email", "Total Orders", "Total Spend", "Registered", "Last Order", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#6b7280] font-sans uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e3df]">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)
                : customers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-[#6b7280] font-sans">
                      <Users size={32} className="mx-auto mb-3 opacity-30" />
                      No customers found
                    </td>
                  </tr>
                ) : customers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => openDetail(c.id)}
                  >
                    <td className="px-4 py-3 text-sm font-sans font-medium text-[#1a1a2e]">{c.name}</td>
                    <td className="px-4 py-3 text-sm font-sans text-[#6b7280]">{c.company || "—"}</td>
                    <td className="px-4 py-3 text-sm font-sans text-[#6b7280]">{c.email}</td>
                    <td className="px-4 py-3 text-sm font-sans text-center font-medium">{c.totalOrders}</td>
                    <td className="px-4 py-3 text-sm font-sans font-semibold text-[#1a1a2e]">
                      {formatCurrency(c.totalSpend)}
                    </td>
                    <td className="px-4 py-3 text-sm font-sans text-[#6b7280] whitespace-nowrap">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm font-sans text-[#6b7280] whitespace-nowrap">
                      {c.lastOrderDate ? formatDate(c.lastOrderDate) : "—"}
                    </td>
                    <td className="px-4 py-3 text-[#6b7280]">
                      <ChevronRight size={16} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer detail modal */}
      <Modal
        open={!!detail || loadingDetail}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.name}` : "Loading..."}
        size="xl"
      >
        {loadingDetail && (
          <div className="py-12 text-center text-[#6b7280] font-sans">Loading customer data...</div>
        )}
        {detail && !loadingDetail && (
          <div className="space-y-6">
            {/* Contact info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#fafaf9] rounded-lg p-4 border border-[#e5e3df]">
                <p className="text-xs text-[#6b7280] font-sans mb-1">Company</p>
                <p className="font-sans font-medium text-[#1a1a2e]">{detail.company || "—"}</p>
              </div>
              <div className="bg-[#fafaf9] rounded-lg p-4 border border-[#e5e3df]">
                <p className="text-xs text-[#6b7280] font-sans mb-1">Email</p>
                <p className="font-sans font-medium text-[#1a1a2e]">{detail.email}</p>
              </div>
              <div className="bg-[#fafaf9] rounded-lg p-4 border border-[#e5e3df]">
                <p className="text-xs text-[#6b7280] font-sans mb-1">Phone</p>
                <p className="font-sans font-medium text-[#1a1a2e]">{detail.phone || "—"}</p>
              </div>
              <div className="bg-[#fafaf9] rounded-lg p-4 border border-[#e5e3df]">
                <p className="text-xs text-[#6b7280] font-sans mb-1">Customer Since</p>
                <p className="font-sans font-medium text-[#1a1a2e]">{formatDate(detail.createdAt)}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 text-center">
                <p className="font-display text-3xl font-semibold text-[#2d4a7a]">{detail.totalOrders}</p>
                <p className="text-xs text-[#6b7280] font-sans">Total Orders</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 text-center">
                <p className="font-display text-3xl font-semibold text-[#c9a84c]">
                  {formatCurrency(detail.totalSpend)}
                </p>
                <p className="text-xs text-[#6b7280] font-sans">Total Spend</p>
              </div>
            </div>

            {/* Order history */}
            <div>
              <h4 className="font-sans text-sm font-semibold text-[#1a1a2e] mb-3">Order History</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {detail.orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-[#fafaf9] rounded-lg border border-[#e5e3df]">
                    <div>
                      <p className="font-sans text-sm font-medium text-[#2d4a7a]">{order.orderNumber}</p>
                      <p className="font-sans text-xs text-[#6b7280]">
                        {formatDate(order.createdAt)} · {order.items.length} items
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <span className="font-sans text-sm font-semibold text-[#1a1a2e]">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
