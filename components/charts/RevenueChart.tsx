"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  category: string;
  revenue: number;
}

export function RevenueChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e3df" vertical={false} />
        <XAxis
          dataKey="category"
          tick={{ fontSize: 11, fill: "#6b7280", fontFamily: "var(--font-geist)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#6b7280", fontFamily: "var(--font-geist)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            border: "1px solid #e5e3df",
            borderRadius: "8px",
            fontSize: "12px",
            fontFamily: "var(--font-geist)",
            boxShadow: "0 4px 12px rgba(26,26,46,0.08)",
          }}
          formatter={(v) => [`$${Number(v ?? 0).toFixed(2)}`, "Revenue"]}
        />
        <Bar dataKey="revenue" fill="#c9a84c" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
