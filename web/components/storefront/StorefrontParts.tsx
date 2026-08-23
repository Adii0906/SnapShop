"use client";

import { MapPin, Phone, ShoppingBag } from "lucide-react";
import { cn, formatINR } from "@/lib/utils";
import type { BusinessDetail, Offer, Product } from "@/lib/types";

export function StoreHeader({
  business,
  cartCount,
  onCartClick,
}: {
  business: BusinessDetail;
  cartCount: number;
  onCartClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <span className="font-display text-lg font-semibold tracking-tight">{business.name}</span>
        <button
          onClick={onCartClick}
          className="relative flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm hover:bg-paper-dim focus-ring"
        >
          <ShoppingBag className="h-4 w-4" />
          Cart
          {cartCount > 0 && (
            <span
              className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-mono font-medium"
              style={{ backgroundColor: business.accent_color, color: "#16151A" }}
            >
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

export function StoreHero({ business }: { business: BusinessDetail }) {
  return (
    <section className="border-b border-line" style={{ backgroundColor: `${business.primary_color}0d` }}>
      <div className="mx-auto max-w-5xl px-6 py-14">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
          {business.hero_title || business.name}
        </h1>
        {business.hero_subtitle && (
          <p className="mt-3 text-ink-soft max-w-lg">{business.hero_subtitle}</p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-ink-soft">
          {business.address && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {business.address}
            </span>
          )}
          {business.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> {business.phone}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

export function OffersStrip({ offers, accent }: { offers: Offer[]; accent: string }) {
  if (offers.length === 0) return null;
  return (
    <div className="border-b border-line overflow-x-auto">
      <div className="mx-auto max-w-5xl px-6 py-3 flex gap-3">
        {offers.map((o) => (
          <span
            key={o.id}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap"
            style={{ backgroundColor: `${accent}22`, color: "#16151A" }}
          >
            {o.title}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CategoryTabs({
  categories,
  active,
  onSelect,
}: {
  categories: { id: string; name: string }[];
  active: string | null;
  onSelect: (name: string | null) => void;
}) {
  if (categories.length <= 1) return null;
  return (
    <div className="mx-auto max-w-5xl px-6 py-4 flex gap-2 overflow-x-auto">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-ring",
          active === null ? "border-ink bg-ink text-paper" : "border-line hover:bg-paper-dim"
        )}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.name)}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-ring",
            active === c.name ? "border-ink bg-ink text-paper" : "border-line hover:bg-paper-dim"
          )}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}

export function ProductGrid({
  products,
  onSelect,
  onAdd,
  accent,
}: {
  products: Product[];
  onSelect: (p: Product) => void;
  onAdd: (p: Product) => void;
  accent: string;
}) {
  if (products.length === 0) {
    return <p className="mx-auto max-w-5xl px-6 py-12 text-sm text-ink-soft">No products in this category yet.</p>;
  }
  return (
    <div className="mx-auto max-w-5xl px-6 pb-16 grid grid-cols-2 sm:grid-cols-3 gap-4">
      {products.map((p) => (
        <div
          key={p.id}
          className="rounded-lg border border-line bg-paper overflow-hidden flex flex-col cursor-pointer hover:border-ink-soft transition-colors"
          onClick={() => onSelect(p)}
        >
          {p.image_url ? (
            <img src={p.image_url} alt={p.name} className="aspect-square w-full object-cover bg-paper-dim/60" />
          ) : (
            <div className="aspect-square bg-paper-dim/60 flex items-center justify-center text-ink-soft text-xs font-mono">
              {p.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="p-3 flex flex-col flex-1">
            <p className="text-sm font-medium line-clamp-2">{p.name}</p>
            <div className="mt-auto pt-2 flex items-center justify-between">
              <span className="font-mono text-sm">{formatINR(p.price)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(p);
                }}
                className="rounded-sm px-2 py-1 text-xs font-medium"
                style={{ backgroundColor: `${accent}33`, color: "#16151A" }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ContactFooter({ business }: { business: BusinessDetail }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-5xl px-6 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-ink-soft">
        <span>{business.name}</span>
        <div className="flex items-center gap-4">
          {business.phone && <span>{business.phone}</span>}
          {business.address && <span>{business.address}</span>}
        </div>
      </div>
    </footer>
  );
}
