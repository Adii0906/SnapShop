"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoreTemplate } from "@/lib/types";

export function TemplateGrid({
  templates,
  selected,
  recommended,
  onSelect,
}: {
  templates: StoreTemplate[];
  selected: string | null;
  recommended: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {templates.map((t) => {
        const isSelected = selected === t.id;
        const isRecommended = recommended === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={cn(
              "relative text-left rounded-lg border p-5 transition-colors focus-ring",
              isSelected ? "border-marigold bg-marigold-dim/30" : "border-line bg-paper hover:border-ink-soft"
            )}
          >
            {isRecommended && (
              <span className="absolute -top-2.5 left-4 rounded-sm bg-ink px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide text-paper">
                AI recommended
              </span>
            )}
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-base font-semibold">{t.name}</h3>
              {isSelected && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-marigold text-ink">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-ink-soft">{t.description}</p>
          </button>
        );
      })}
    </div>
  );
}
