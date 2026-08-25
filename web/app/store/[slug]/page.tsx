"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getBusiness } from "@/lib/api";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { ProductModal } from "@/components/storefront/ProductModal";
import { SellerToolbar } from "@/components/storefront/SellerToolbar";
import {
  CategoryTabs,
  ContactFooter,
  OffersStrip,
  ProductGrid,
  StoreHeader,
  StoreHero,
} from "@/components/storefront/StorefrontParts";
import { isStoreOwned } from "@/lib/store-ownership";
import type { BusinessDetail, CartLine, Product } from "@/lib/types";

export default function StorefrontPage() {
  const { slug } = useParams<{ slug: string }>();

  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    // Read after mount only - localStorage isn't available during SSR, and
    // this is a client-only "probably the seller" signal anyway (see
    // lib/store-ownership.ts), never something to gate real access on.
    setIsOwner(isStoreOwned(slug));
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    getBusiness(slug)
      .then((data) => {
        if (!cancelled) {
          setBusiness(data);
          setLoadState("ready");
        }
      })
      .catch(() => !cancelled && setLoadState("error"));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  function addToCart(product: Product, qty: number) {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        return prev.map((l) => (l.productId === product.id ? { ...l, qty: l.qty + qty } : l));
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, qty }];
    });
  }

  function updateQty(productId: string, qty: number) {
    setCart((prev) =>
      qty <= 0 ? prev.filter((l) => l.productId !== productId) : prev.map((l) => (l.productId === productId ? { ...l, qty } : l))
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  }

  if (loadState === "loading") {
    return <div className="min-h-screen bg-paper" />;
  }

  if (loadState === "error" || !business) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-display text-xl font-semibold">Store not found</p>
          <p className="mt-2 text-sm text-ink-soft">
            No store at &ldquo;{slug}&rdquo;. Make sure the API server is running and the store was created.
          </p>
          <Link href="/" className="mt-4 inline-block text-sm underline">
            Back to SnapShop
          </Link>
        </div>
      </main>
    );
  }

  const publishedProducts = business.products.filter((p) => p.is_published);
  const filteredProducts = activeCategory
    ? publishedProducts.filter((p) => p.category_name === activeCategory)
    : publishedProducts;
  const cartCount = cart.reduce((sum, l) => sum + l.qty, 0);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <StoreHeader business={business} cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} />
      <StoreHero business={business} />
      <OffersStrip offers={business.offers} accent={business.accent_color} />
      <CategoryTabs categories={business.categories} active={activeCategory} onSelect={setActiveCategory} />
      <ProductGrid
        products={filteredProducts}
        onSelect={setSelectedProduct}
        onAdd={(p) => addToCart(p, 1)}
        accent={business.accent_color}
      />
      <ContactFooter business={business} />

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAdd={(qty) => {
          if (selectedProduct) addToCart(selectedProduct, qty);
          setSelectedProduct(null);
        }}
        accent={business.accent_color}
      />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        lines={cart}
        onUpdateQty={updateQty}
        onRemove={removeFromCart}
        business={business}
        onOrderPlaced={() => setCart([])}
      />
      {isOwner && <SellerToolbar slug={slug} />}
    </main>
  );
}
