"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastItem {
  id: number;
  message: string;
  variant: "success" | "error";
}

interface ToastContextValue {
  showToast: (message: string, variant?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

/**
 * App-wide toast notifications. Mounted once in the root layout so any
 * page can call useToast() - a single reusable piece of infrastructure
 * instead of ad-hoc per-page save-confirmation state.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, variant: "success" | "error" = "success") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm shadow-lg",
                t.variant === "success"
                  ? "border-success/30 bg-success-dim text-success"
                  : "border-danger/30 bg-danger-dim text-danger"
              )}
            >
              {t.variant === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <X className="h-4 w-4 shrink-0" />
              )}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
