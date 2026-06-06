import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-gray-200", className)} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-card">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/3 mt-2" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
