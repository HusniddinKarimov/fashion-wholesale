"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ShoppingBag, ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
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
  items: OrderItem[];
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Order | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-semibold text-[#1a1a2e] mb-1">My Orders</h1>
          <p className="text-[#6b7280] font-sans">Track and manage your wholesale orders</p>
        </div>
        <Link href="/orders/new">
          <Button>
            <ShoppingBag size={16} />
            New Order
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e3df] bg-gray-50">
                {["Order #", "Date", "Items", "Total", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#6b7280] font-sans uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)}
            </tbody>
          </table>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 text-[#6b7280] font-sans">
          <Package size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No orders yet</p>
          <p className="text-sm mb-6">Start by browsing the catalogue</p>
          <Link href="/catalogue"><Button>Browse Catalogue</Button></Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e3df] bg-gray-50">
                {["Order #", "Date", "Items", "Total", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#6b7280] font-sans uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e3df]">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setDetail(order)}
                >
                  <td className="px-4 py-3 font-sans text-sm font-medium text-[#2d4a7a]">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-[#6b7280]">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-[#1a1a2e]">
                    {order.items.length} {order.items.length === 1 ? "item" : "items"}
                  </td>
                  <td className="px-4 py-3 font-sans text-sm font-semibold text-[#1a1a2e]">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-[#6b7280]">
                    <ChevronRight size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `Order ${detail.orderNumber}` : ""}
        size="lg"
      >
        {detail && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <StatusBadge status={detail.status} />
              <span className="text-sm text-[#6b7280] font-sans">{formatDate(detail.createdAt)}</span>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-sans text-sm font-medium text-[#1a1a2e] mb-3">Line Items</h4>
              <div className="space-y-2">
                {detail.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-[#fafaf9] rounded-lg border border-[#e5e3df]">
                    <img src={item.product.imageUrl} alt="" className="w-12 h-14 object-cover rounded-md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm font-medium text-[#1a1a2e] truncate">{item.product.name}</p>
                      <p className="font-sans text-xs text-[#6b7280]">{item.product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-sans text-sm font-semibold text-[#1a1a2e]">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </p>
                      <p className="font-sans text-xs text-[#6b7280]">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping address */}
            <div>
              <h4 className="font-sans text-sm font-medium text-[#1a1a2e] mb-2">Shipping Address</h4>
              {(() => {
                const addr = JSON.parse(detail.shippingAddress);
                return (
                  <p className="text-sm text-[#6b7280] font-sans">
                    {addr.street}, {addr.city}, {addr.state} {addr.zip}, {addr.country}
                  </p>
                );
              })()}
            </div>

            {detail.notes && (
              <div>
                <h4 className="font-sans text-sm font-medium text-[#1a1a2e] mb-1">Notes</h4>
                <p className="text-sm text-[#6b7280] font-sans">{detail.notes}</p>
              </div>
            )}

            <div className="border-t border-[#e5e3df] pt-4 flex justify-between items-center">
              <span className="font-sans font-medium text-[#1a1a2e]">Total</span>
              <span className="font-display text-2xl font-semibold text-[#1a1a2e]">
                {formatCurrency(detail.totalAmount)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
