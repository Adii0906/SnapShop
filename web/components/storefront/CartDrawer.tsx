"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import type { BusinessDetail, CartLine } from "@/lib/types";

export function CartDrawer({
  isOpen,
  onClose,
  lines,
  onUpdateQty,
  onRemove,
  business,
  onOrderPlaced,
}: {
  isOpen: boolean;
  onClose: () => void;
  lines: CartLine[];
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  business: BusinessDetail;
  onOrderPlaced: () => void;
}) {
  const [step, setStep] = useState<"cart" | "checkout" | "done">("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const total = lines.reduce((sum, l) => sum + l.qty * l.price, 0);

  function close() {
    onClose();
    setTimeout(() => setStep("cart"), 300);
  }

  function placeOrder() {
    const orderLines = lines.map((l) => `${l.qty} x ${l.name} - ${formatINR(l.qty * l.price)}`).join("\n");
    const message = `Order from ${business.name} storefront:\n\n${orderLines}\n\nTotal: ${formatINR(total)}\n\nName: ${name}\nPhone: ${phone}`;
    const waNumber = (business.whatsapp || business.phone || "").replace(/\D/g, "");
    if (waNumber) {
      window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, "_blank");
    }
    setStep("done");
    onOrderPlaced();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-ink/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-paper z-50 shadow-xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
          >
            <div className="flex items-center justify-between p-5 border-b border-line">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Your order
              </h2>
              <button onClick={close} className="p-1.5 rounded-sm hover:bg-paper-dim focus-ring" aria-label="Close cart">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {step === "cart" && (
                <>
                  {lines.length === 0 ? (
                    <p className="text-sm text-ink-soft">Your cart is empty.</p>
                  ) : (
                    <div className="space-y-4">
                      {lines.map((l) => (
                        <div key={l.productId} className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{l.name}</p>
                            <p className="text-xs text-ink-soft font-mono">{formatINR(l.price)}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => onUpdateQty(l.productId, l.qty - 1)}
                              className="h-7 w-7 flex items-center justify-center rounded-sm border border-line hover:bg-paper-dim focus-ring"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-5 text-center text-sm font-mono">{l.qty}</span>
                            <button
                              onClick={() => onUpdateQty(l.productId, l.qty + 1)}
                              className="h-7 w-7 flex items-center justify-center rounded-sm border border-line hover:bg-paper-dim focus-ring"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => onRemove(l.productId)}
                              className="text-xs text-danger hover:underline ml-1"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {step === "checkout" && (
                <div className="space-y-4">
                  <p className="text-sm text-ink-soft">
                    Orders are sent straight to the shop&apos;s WhatsApp - no account needed.
                  </p>
                  <div>
                    <label className="text-xs font-medium text-ink-soft">Your name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 h-10 w-full rounded-md border border-line bg-paper px-3 text-sm focus-ring"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-soft">Phone number</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 h-10 w-full rounded-md border border-line bg-paper px-3 text-sm focus-ring"
                      placeholder="For delivery updates"
                    />
                  </div>
                </div>
              )}

              {step === "done" && (
                <div className="text-center py-8">
                  <p className="font-display text-lg font-semibold">Order sent</p>
                  <p className="mt-2 text-sm text-ink-soft">
                    Check WhatsApp to confirm the order with {business.name}.
                  </p>
                </div>
              )}
            </div>

            {step !== "done" && (
              <div className="p-5 border-t border-line">
                <div className="flex items-center justify-between mb-3 text-sm">
                  <span className="text-ink-soft">Total</span>
                  <span className="font-mono font-semibold">{formatINR(total)}</span>
                </div>
                {step === "cart" ? (
                  <Button
                    variant="accent"
                    size="lg"
                    className="w-full"
                    disabled={lines.length === 0}
                    onClick={() => setStep("checkout")}
                  >
                    Checkout
                  </Button>
                ) : (
                  <Button variant="accent" size="lg" className="w-full" onClick={placeOrder} disabled={!name || !phone}>
                    Place order via WhatsApp
                  </Button>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
