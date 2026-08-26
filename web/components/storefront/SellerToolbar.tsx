"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, Package, Settings, Store, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Subtle floating entry point to the seller dashboard, shown only to
 * (probably) the store's own owner - see lib/store-ownership.ts. Sits
 * top-right, just below the sticky store header, so it's immediately
 * visible without competing with it. Mirrors CartDrawer's slide-in panel
 * conventions (same overlay/z-index/timing/edge) so it reads as part of
 * the same system rather than a bolted-on admin panel.
 */
export function SellerToolbar({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: `/dashboard/${slug}`, label: "Seller Dashboard", icon: LayoutDashboard, primary: true },
    { href: `/dashboard/${slug}/products`, label: "Products", icon: Package },
    { href: `/dashboard/${slug}/customization`, label: "Store Settings", icon: Settings },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-20 right-5 z-20 flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5 text-sm font-medium text-ink-soft shadow-md transition-colors hover:text-ink hover:border-ink-soft focus-ring"
        aria-label="Open seller tools"
      >
        <LayoutDashboard className="h-4 w-4" />
        Seller tools
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-ink/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed right-0 top-0 bottom-0 w-full max-w-xs bg-paper z-50 shadow-xl flex flex-col border-l border-line"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-line">
                <span className="font-display text-base font-semibold">Seller tools</span>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-sm hover:bg-paper-dim focus-ring"
                  aria-label="Close seller tools"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="flex-1 p-3 space-y-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-paper-dim hover:text-ink"
                >
                  <Store className="h-4 w-4" strokeWidth={1.75} />
                  View Store
                </button>
                {links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors",
                      item.primary
                        ? "bg-ink text-paper hover:bg-ink/90"
                        : "text-ink-soft hover:bg-paper-dim hover:text-ink"
                    )}
                  >
                    <item.icon className="h-4 w-4" strokeWidth={1.75} />
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-line text-xs text-ink-soft">
                Only visible to you as the store owner.
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
