"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, DollarSign, Users, AlertTriangle } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { OrdersChart } from "@/components/charts/OrdersChart";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { StatusDonut } from "@/components/charts/StatusDonut";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

interface Stats {
  kpis: {
    totalOrdersMonth: number;
    revenueMonth: number;
    activeBuyers: number;
    lowStockItems: number;
  };
  ordersPerDay: { date: string; count: number }[];
  revenueByCategory: { category: string; revenue: number }[];
  statusBreakdown: { status: string; count: number }[];
}

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
  category: string;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: { name: string; company: string | null };
  items: { quantity: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [restockProduct, setRestockProduct] = useState<LowStockProduct | null>(null);
  const [newStock, setNewStock] = useState("");
  const [restocking, setRestocking] = useState(false);

  const fetchAll = async () => {
    const [statsRes, ordersRes, stockRes] = await Promise.all([
      fetch("/api/dashboard/stats"),
      fetch("/api/orders"),
      fetch("/api/products?inStock=false&sort=price-asc"),
    ]);
    const [statsData, ordersData, _productsData] = await Promise.all([
      statsRes.json(),
      ordersRes.json(),
      stockRes.json(),
    ]);

    setStats(statsData);
    setRecentOrders(ordersData.slice(0, 10));

    const allProducts = await fetch("/api/products").then((r) => r.json());
    setLowStock(allProducts.filter((p: any) => p.stock > 0 && p.stock < 50));
  };

  useEffect(() => { fetchAll(); }, []);

  const updateOrderStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchAll();
  };

  const handleRestock = async () => {
    if (!restockProduct || !newStock) return;
    setRestocking(true);
    await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: restockProduct.id, stock: parseInt(newStock) }),
    });
    setRestocking(false);
    setRestockProduct(null);
    setNewStock("");
    fetchAll();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-semibold text-[#1a1a2e] mb-1">Dashboard</h1>
        <p className="text-[#6b7280] font-sans">Business overview — live from database</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats ? (
          <>
            <KPICard
              title="Orders This Month"
              value={stats.kpis.totalOrdersMonth}
              icon={ShoppingBag}
              color="blue"
              index={0}
            />
            <KPICard
              title="Revenue This Month"
              value={formatCurrency(stats.kpis.revenueMonth)}
              icon={DollarSign}
              color="gold"
              index={1}
            />
            <KPICard
              title="Active Buyers"
              value={stats.kpis.activeBuyers}
              icon={Users}
              color="green"
              index={2}
            />
            <KPICard
              title="Low Stock Items"
              value={stats.kpis.lowStockItems}
              subtitle="< 50 units remaining"
              icon={AlertTriangle}
              color="red"
              index={3}
            />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-card border border-[#e5e3df]">
              <Skeleton className="h-4 w-2/3 mb-4" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          ))
        )}
      </div>

      {/* Charts */}
      {stats && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-card border border-[#e5e3df]">
            <h3 className="font-display text-xl font-semibold text-[#1a1a2e] mb-4">
              Orders — Last 30 Days
            </h3>
            <OrdersChart data={stats.ordersPerDay} />
          </div>
          <div className="bg-white rounded-xl p-6 shadow-card border border-[#e5e3df]">
            <h3 className="font-display text-xl font-semibold text-[#1a1a2e] mb-4">
              Order Status
            </h3>
            <StatusDonut data={stats.statusBreakdown} />
          </div>
        </div>
      )}

      {stats && stats.revenueByCategory.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-card border border-[#e5e3df]">
          <h3 className="font-display text-xl font-semibold text-[#1a1a2e] mb-4">
            Revenue by Category
          </h3>
          <RevenueChart data={stats.revenueByCategory} />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-card border border-[#e5e3df] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e5e3df]">
            <h3 className="font-display text-xl font-semibold text-[#1a1a2e]">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-[#e5e3df]">
                  {["Order #", "Buyer", "Total", "Status", "Update"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#6b7280] font-sans uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e3df]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-sans font-medium text-[#2d4a7a]">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-sans text-[#1a1a2e]">{order.user.name}</p>
                      <p className="text-xs text-[#6b7280] font-sans">{order.user.company}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-sans font-semibold text-[#1a1a2e]">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-xs border border-[#e5e3df] rounded-md px-2 py-1 font-sans focus:outline-none focus:ring-1 focus:ring-[#2d4a7a] cursor-pointer"
                      >
                        {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-card border border-[#e5e3df] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e5e3df] flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <h3 className="font-display text-xl font-semibold text-[#1a1a2e]">Low Stock</h3>
          </div>
          <div className="divide-y divide-[#e5e3df] max-h-80 overflow-y-auto">
            {lowStock.length === 0 ? (
              <p className="px-6 py-8 text-sm text-[#6b7280] font-sans text-center">All products well stocked</p>
            ) : (
              lowStock.map((p) => (
                <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-sans font-medium text-[#1a1a2e] truncate">{p.name}</p>
                    <p className="text-xs text-amber-600 font-sans">{p.stock} units left</p>
                  </div>
                  <button
                    onClick={() => { setRestockProduct(p); setNewStock(""); }}
                    className="text-xs font-sans font-medium text-[#2d4a7a] hover:underline shrink-0"
                  >
                    Restock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Restock modal */}
      <Modal
        open={!!restockProduct}
        onClose={() => setRestockProduct(null)}
        title={`Restock — ${restockProduct?.name}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#6b7280] font-sans">
            Current stock: <strong className="text-[#1a1a2e]">{restockProduct?.stock} units</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-[#1a1a2e] font-sans mb-1.5">
              New Stock Level
            </label>
            <input
              type="number"
              min={0}
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              placeholder="e.g. 200"
              className="w-full h-10 border border-[#e5e3df] rounded-md px-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#2d4a7a]"
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleRestock} loading={restocking} className="flex-1">
              Update Stock
            </Button>
            <Button variant="secondary" onClick={() => setRestockProduct(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
