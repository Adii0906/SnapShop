"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/review/ProductTable";
import type { ExtractedOffer, ExtractedProduct, ExtractionResult } from "@/lib/types";

export default function ReviewPage() {
  const router = useRouter();
  const [data, setData] = useState<ExtractionResult | null>(null);
  const [products, setProducts] = useState<ExtractedProduct[]>([]);
  const [offers, setOffers] = useState<ExtractedOffer[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem("snapshop:extraction") ?? sessionStorage.getItem("shopsnap:extraction");
    if (!raw) {
      router.replace("/upload");
      return;
    }
    const parsed: ExtractionResult = JSON.parse(raw);
    setData(parsed);
    setProducts(parsed.products);
    setOffers(parsed.offers);
  }, [router]);

  if (!data) return null;
  const extraction = data;

  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  function updateProduct(index: number, patch: Partial<ExtractedProduct>) {
    setProducts((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function deleteProduct(index: number) {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  }

  function addProduct() {
    setProducts((prev) => [
      ...prev,
      { name: "", price: 0, category: categories[0] || "Uncategorized", description: "", confidence: 1, stock: 100 },
    ]);
  }

  function deleteOffer(index: number) {
    setOffers((prev) => prev.filter((_, i) => i !== index));
  }

  function addOffer() {
    setOffers((prev) => [...prev, { title: "New offer", description: "" }]);
  }

  function handleContinue() {
    const finalized: ExtractionResult = {
      ...extraction,
      products,
      offers,
      stats: {
        products: products.length,
        categories: categories.length,
        offers: offers.length,
        businesses: 1,
      },
    };
    sessionStorage.setItem("snapshop:finalized", JSON.stringify(finalized));
    router.push("/templates");
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="mx-auto max-w-4xl px-6 py-6 flex items-center justify-between">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          SnapShop
        </Link>
        <span className="font-mono text-xs text-ink-soft">Step 3 of 4</span>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
          Review what we found
        </h1>
        <p className="mt-2 text-ink-soft">
          {data.business.name} - {products.length} products across {categories.length} categories.
          Low-confidence rows are highlighted; fix anything that looks off before generating the store.
        </p>

        <div className="mt-8">
          <ProductTable
            products={products}
            categories={categories}
            onChange={updateProduct}
            onDelete={deleteProduct}
            onAdd={addProduct}
          />
        </div>

        <div className="mt-10">
          <h2 className="font-display text-lg font-semibold tracking-tight">Offers</h2>
          <div className="mt-3 space-y-2">
            {offers.map((offer, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-md border border-line bg-paper-dim/30 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{offer.title}</p>
                  {offer.description && (
                    <p className="text-xs text-ink-soft mt-0.5">{offer.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => deleteOffer(i)}
                  className="rounded-sm p-1.5 text-ink-soft hover:bg-paper-dim hover:text-danger focus-ring shrink-0"
                  aria-label={`Remove ${offer.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {offers.length === 0 && (
              <p className="text-sm text-ink-soft">No offers extracted.</p>
            )}
          </div>
          <Button variant="ghost" size="sm" className="mt-3" onClick={addOffer}>
            <Plus className="h-3.5 w-3.5" /> Add offer
          </Button>
        </div>

        <div className="mt-12 flex items-center justify-between">
          <Link href="/upload">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <Button variant="accent" size="lg" onClick={handleContinue} disabled={products.length === 0}>
            Generate My Store <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </main>
  );
}
