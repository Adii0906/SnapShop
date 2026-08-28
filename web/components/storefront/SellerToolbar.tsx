"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, Package, Settings, Store } from "lucide-react";
import { listOwnedStores } from "@/lib/store-ownership";

/**
 * Persistent seller admin strip, shown only to (probably) the store's own
 * owner - see lib/store-ownership.ts. The parent page stacks this above
 * the public StoreHeader without modifying StorefrontParts.tsx at all, so
 * the customer-facing header is completely untouched. Always visible at
 * the top of the page (not a floating button) so the seller never needs
 * the browser back button to reach their dashboard.
 */
export function SellerToolbar({ slug }: { slug: string }) {
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const otherStores = listOwnedStores().filter((s) => s !== slug);

  const links = [
    { href: `/dashboard/${slug}`, label: "Seller Dashboard", icon: LayoutDashboard },
    { href: `/dashboard/${slug}/products`, label: "Manage Products", icon: Package },
    { href: `/dashboard/${slug}/customization`, label: "Store Settings", icon: Settings },
  ];

  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto max-w-5xl px-6 h-10 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 shrink-0 text-paper/70">
          <Store className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span className="hidden sm:inline" title="Only visible to you as the store owner">
            Seller view
          </span>
          {otherStores.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setSwitcherOpen((v) => !v)}
                className="flex items-center gap-1 rounded-sm px-1.5 py-0.5 transition-colors hover:bg-paper/10 focus-ring"
              >
                Switch store <span aria-hidden>&#9662;</span>
              </button>
              <AnimatePresence>
                {switcherOpen && (
                  <>
                    {/* Click-outside-to-close catcher, below the menu itself in z-order */}
                    <div className="fixed inset-0 z-40" onClick={() => setSwitcherOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-1 min-w-40 rounded-md border border-line bg-paper py-1 text-ink shadow-lg z-50"
                    >
                      {otherStores.map((s) => (
                        <Link
                          key={s}
                          href={`/store/${s}`}
                          onClick={() => setSwitcherOpen(false)}
                          className="block px-3 py-1.5 text-sm transition-colors hover:bg-paper-dim"
                        >
                          {s}
                        </Link>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm px-2.5 py-1.5 text-paper/80 transition-colors hover:bg-paper/10 hover:text-paper focus-ring"
            >
              <item.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
