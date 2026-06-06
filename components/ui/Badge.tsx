import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "muted";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    danger: "bg-red-50 text-red-700 ring-1 ring-red-200",
    info: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    muted: "bg-gray-50 text-gray-500 ring-1 ring-gray-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeProps["variant"]; label: string }> = {
    Pending: { variant: "warning", label: "Pending" },
    Processing: { variant: "info", label: "Processing" },
    Shipped: { variant: "default", label: "Shipped" },
    Delivered: { variant: "success", label: "Delivered" },
    Cancelled: { variant: "danger", label: "Cancelled" },
  };

  const { variant, label } = map[status] || { variant: "muted", label: status };
  return <Badge variant={variant}>{label}</Badge>;
}

export function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge variant="danger">Out of Stock</Badge>;
  if (stock < 50) return <Badge variant="warning">Low Stock</Badge>;
  return <Badge variant="success">In Stock</Badge>;
}
