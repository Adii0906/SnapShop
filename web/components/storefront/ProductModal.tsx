"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductModal({
  product,
  onClose,
  onAdd,
  accent,
}: {
  product: Product | null;
  onClose: () => void;
  onAdd: (qty: number) => void;
  accent: string;
}) {
  const [qty, setQty] = useState(1);

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            className="fixed inset-0 bg-ink/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-4 bottom-4 sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-paper rounded-lg z-50 p-6 shadow-xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1.5 rounded-sm hover:bg-paper-dim focus-ring"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {product.category_name && (
              <span className="inline-block rounded-sm bg-paper-dim px-2 py-0.5 text-[11px] font-mono text-ink-soft">
                {product.category_name}
              </span>
            )}
            {product.image_url && (
              <img src={product.image_url} alt={product.name} className="mt-4 h-52 w-full rounded-md object-cover border border-line" />
            )}
            <h2 className="mt-2 font-display text-xl font-semibold">{product.name}</h2>
            <p className="mt-1 font-mono text-lg" style={{ color: accent }}>
              {formatINR(product.price)}
            </p>
            {product.description && (
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">{product.description}</p>
            )}

            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-9 w-9 flex items-center justify-center rounded-md border border-line hover:bg-paper-dim focus-ring"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center font-mono">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="h-9 w-9 flex items-center justify-center rounded-md border border-line hover:bg-paper-dim focus-ring"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <Button
                size="lg"
                className="flex-1"
                style={{ backgroundColor: accent, color: "#16151A" }}
                onClick={() => {
                  onAdd(qty);
                  setQty(1);
                }}
              >
                Add to cart
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
