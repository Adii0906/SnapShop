"use client";

import { Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, confidenceTier } from "@/lib/utils";
import type { ExtractedProduct } from "@/lib/types";

const TIER_VARIANT = { high: "success", medium: "warning", low: "danger" } as const;

export function ProductTable({
  products,
  categories,
  onChange,
  onDelete,
  onAdd,
}: {
  products: ExtractedProduct[];
  categories: string[];
  onChange: (index: number, patch: Partial<ExtractedProduct>) => void;
  onDelete: (index: number) => void;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-lg border border-line overflow-hidden">
      <datalist id="category-options">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-paper-dim/50 text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium w-32">Price</th>
              <th className="px-4 py-3 font-medium w-40">Category</th>
              <th className="px-4 py-3 font-medium w-24">Confidence</th>
              <th className="px-4 py-3 font-medium w-10" />
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => {
              const tier = confidenceTier(p.confidence);
              return (
                <tr
                  key={i}
                  className={cn(
                    "border-b border-line last:border-0",
                    tier === "low" && "bg-danger-dim/40"
                  )}
                >
                  <td className="px-4 py-2">
                    <Input
                      value={p.name}
                      onChange={(e) => onChange(i, { name: e.target.value, confidence: 1 })}
                      className="border-transparent bg-transparent px-2 focus-visible:border-line"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1 font-mono">
                      <span className="text-ink-soft">Rs.</span>
                      <Input
                        type="number"
                        value={p.price}
                        onChange={(e) => onChange(i, { price: Number(e.target.value), confidence: 1 })}
                        className="border-transparent bg-transparent px-1 font-mono focus-visible:border-line"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      list="category-options"
                      value={p.category}
                      onChange={(e) => onChange(i, { category: e.target.value, confidence: 1 })}
                      className="border-transparent bg-transparent px-2 focus-visible:border-line"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant={TIER_VARIANT[tier]}>{Math.round(p.confidence * 100)}%</Badge>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onDelete(i)}
                      className="rounded-sm p-1.5 text-ink-soft hover:bg-paper-dim hover:text-danger focus-ring"
                      aria-label={`Remove ${p.name || "product"}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-line bg-paper-dim/20">
        <Button variant="ghost" size="sm" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" /> Add product
        </Button>
      </div>
    </div>
  );
}
