"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateGrid } from "@/components/templates/TemplateGrid";
import { finalizeStore, listTemplates, recommendTemplate } from "@/lib/api";
import type { ExtractionResult, StoreTemplate } from "@/lib/types";

export default function TemplatesPage() {
  const router = useRouter();
  const [data, setData] = useState<ExtractionResult | null>(null);
  const [templates, setTemplates] = useState<StoreTemplate[]>([]);
  const [recommended, setRecommended] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("snapshop:finalized") ?? sessionStorage.getItem("shopsnap:finalized");
    if (!raw) {
      router.replace("/upload");
      return;
    }
    const parsed: ExtractionResult = JSON.parse(raw);
    setData(parsed);

    listTemplates().then(setTemplates).catch(() => setError("Could not load templates"));
    recommendTemplate(parsed.business.category).then((r) => {
      setRecommended(r.recommended);
      setSelected(r.recommended);
    });
  }, [router]);

  async function handleUseTemplate() {
    if (!data || !selected) return;
    setIsCreating(true);
    setError(null);
    try {
      const created = await finalizeStore({
        business: data.business,
        products: data.products,
        offers: data.offers,
        template: selected,
      });
      sessionStorage.removeItem("snapshop:extraction");
      sessionStorage.removeItem("snapshop:finalized");
      sessionStorage.removeItem("shopsnap:extraction");
      sessionStorage.removeItem("shopsnap:finalized");
      router.push(`/store-ready?slug=${created.slug}`);
    } catch {
      setError("Could not create the store. Check that the API server is running.");
      setIsCreating(false);
    }
  }

  if (!data) return null;

  const recommendedTemplate = templates.find((t) => t.id === recommended);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="mx-auto max-w-4xl px-6 py-6 flex items-center justify-between">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          SnapShop
        </Link>
        <span className="font-mono text-xs text-ink-soft">Step 4 of 4</span>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
          Choose a store template
        </h1>

        {recommendedTemplate && (
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-marigold/40 bg-marigold-dim/30 p-5">
            <Sparkles className="h-5 w-5 text-marigold-ink shrink-0 mt-0.5" strokeWidth={1.75} />
            <div>
              <p className="text-sm text-ink-soft">
                AI detected <span className="font-medium text-ink">{data.business.name}</span> as{" "}
                <span className="font-medium text-ink">{data.business.category}</span>
              </p>
              <p className="mt-1 font-display text-lg font-semibold">
                Recommended: {recommendedTemplate.name}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8">
          <TemplateGrid
            templates={templates}
            selected={selected}
            recommended={recommended}
            onSelect={setSelected}
          />
        </div>

        {error && <p className="mt-4 text-sm text-danger">{error}</p>}

        <div className="mt-12 flex items-center justify-between">
          <Link href="/review">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <Button
            variant="accent"
            size="lg"
            onClick={handleUseTemplate}
            disabled={!selected || isCreating}
          >
            {isCreating ? "Generating..." : "Use This Template"} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </main>
  );
}
