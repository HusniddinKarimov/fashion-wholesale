"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DataPoint {
  status: string;
  count: number;
}

const COLORS: Record<string, string> = {
  Pending: "#f59e0b",
  Processing: "#3b82f6",
  Shipped: "#8b5cf6",
  Delivered: "#10b981",
  Cancelled: "#ef4444",
};

export function StatusDonut({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          dataKey="count"
          nameKey="status"
          paddingAngle={3}
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={COLORS[entry.status] || "#9ca3af"} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            border: "1px solid #e5e3df",
            borderRadius: "8px",
            fontSize: "12px",
            fontFamily: "var(--font-geist)",
            boxShadow: "0 4px 12px rgba(26,26,46,0.08)",
          }}
          formatter={(v, name) => [v, name]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "12px", fontFamily: "var(--font-geist)" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
