"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBag, LayoutDashboard, Package, LogOut, Menu, X, Users } from "lucide-react";
import { useState } from "react";
import { isStaff, CAN } from "@/lib/roles";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  SUPERADMIN: { label: "Super Admin", color: "bg-purple-100 text-purple-700" },
  ADMIN:      { label: "Admin",       color: "bg-blue-100 text-blue-700" },
  MANAGER:    { label: "Manager",     color: "bg-teal-100 text-teal-700" },
  USER:       { label: "User",        color: "bg-gray-100 text-gray-600" },
};

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = session?.user as any;
  const role: string = user?.role ?? "USER";
  const staff = isStaff(role);

  const staffLinks = [
    { href: "/dashboard",            label: "Dashboard", icon: LayoutDashboard, show: true },
    { href: "/dashboard/orders",     label: "Orders",    icon: ShoppingBag,     show: true },
    { href: "/dashboard/inventory",  label: "Inventory", icon: Package,         show: CAN.manageInventory(role) },
    { href: "/dashboard/customers",  label: "Customers", icon: Users,           show: CAN.manageCustomers(role) },
  ].filter((l) => l.show);

  const userLinks = [
    { href: "/catalogue", label: "Catalogue", icon: Package },
    { href: "/orders",    label: "My Orders", icon: ShoppingBag },
  ];

  const links = staff ? staffLinks : userLinks;
  const homeHref = staff ? "/dashboard" : "/catalogue";
  const roleInfo = ROLE_LABELS[role] ?? ROLE_LABELS.USER;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={homeHref} className="flex items-center gap-2">
            <span className="font-display text-xl font-semibold text-ink tracking-wide">
              FashionWholesale
            </span>
            <span className="hidden sm:inline text-xs text-gold font-sans font-medium uppercase tracking-widest">
              Corp
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-muted hover:text-ink hover:bg-gray-50 transition-colors"
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {session && (
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-medium text-ink font-sans">{user?.name}</p>
                  <span className={`inline-block text-[10px] font-semibold font-sans px-2 py-0.5 rounded-full ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-2 rounded-md text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
            <button
              className="md:hidden p-2 rounded-md text-muted hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border px-4 py-3 space-y-1">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-ink font-sans">{user?.name}</p>
            <span className={`inline-block text-[10px] font-semibold font-sans px-2 py-0.5 rounded-full mt-1 ${roleInfo.color}`}>
              {roleInfo.label}
            </span>
          </div>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted hover:text-ink hover:bg-gray-50"
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:bg-red-50"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
