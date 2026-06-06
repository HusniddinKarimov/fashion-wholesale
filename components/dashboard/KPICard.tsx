"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  color?: "blue" | "gold" | "green" | "red";
  index?: number;
}

export function KPICard({ title, value, subtitle, icon: Icon, color = "blue", index = 0 }: KPICardProps) {
  const colorMap = {
    blue: { bg: "bg-blue-50", icon: "text-[#2d4a7a]", border: "border-blue-100" },
    gold: { bg: "bg-amber-50", icon: "text-[#c9a84c]", border: "border-amber-100" },
    green: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-100" },
    red: { bg: "bg-red-50", icon: "text-red-500", border: "border-red-100" },
  };

  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-white rounded-xl p-6 shadow-card border border-[#e5e3df]"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-sans text-[#6b7280] font-medium">{title}</p>
        <div className={cn("p-2 rounded-lg border", c.bg, c.border)}>
          <Icon size={18} className={c.icon} />
        </div>
      </div>
      <div className="font-display text-3xl font-semibold text-[#1a1a2e]">{value}</div>
      {subtitle && (
        <p className="text-xs text-[#6b7280] font-sans mt-1">{subtitle}</p>
      )}
    </motion.div>
  );
}
