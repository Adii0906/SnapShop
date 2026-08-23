"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  LayoutDashboard,
  Package,
  Percent,
  Settings,
  ShoppingCart,
  Store,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";

function navItems(slug: string) {
  const base = `/dashboard/${slug}`;
  return [
    { href: base, label: "Overview", icon: LayoutDashboard, exact: true },
    { href: `${base}/products`, label: "Products", icon: Package },
    { href: `${base}/orders`, label: "Orders", icon: ShoppingCart },
    { href: `${base}/inventory`, label: "Inventory", icon: Warehouse },
    { href: `${base}/discounts`, label: "Discounts", icon: Percent },
    { href: `${base}/analytics`, label: "Analytics", icon: BarChart3 },
    { href: `${base}/customization`, label: "Store Customization", icon: Store },
    { href: `${base}/assistant`, label: "AI Assistant", icon: Bot },
    { href: `${base}/settings`, label: "Settings", icon: Settings },
  ];
}

export function DashboardSidebar({ slug }: { slug: string }) {
  const pathname = usePathname();
  const items = navItems(slug);

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-line bg-paper-dim/20 min-h-screen">
      <div className="px-5 py-6">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          SnapShop
        </Link>
      </div>
      <nav className="flex-1 px-3 space-y-0.5">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-dim hover:text-ink"
              )}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-line">
        <Link
          href={`/store/${slug}`}
          target="_blank"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-soft hover:bg-paper-dim hover:text-ink"
        >
          <Store className="h-4 w-4" strokeWidth={1.75} />
          View live store
        </Link>
      </div>
    </aside>
  );
}
