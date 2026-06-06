"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

interface DataPoint {
  date: string;
  count: number;
}

export function OrdersChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e3df" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#6b7280", fontFamily: "var(--font-geist)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => {
            try { return format(parseISO(val), "d MMM"); } catch { return val; }
          }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#6b7280", fontFamily: "var(--font-geist)" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            border: "1px solid #e5e3df",
            borderRadius: "8px",
            fontSize: "12px",
            fontFamily: "var(--font-geist)",
            boxShadow: "0 4px 12px rgba(26,26,46,0.08)",
          }}
          labelFormatter={(val) => {
            try { return format(parseISO(val as string), "MMM d, yyyy"); } catch { return val; }
          }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#2d4a7a"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4, fill: "#2d4a7a", strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
