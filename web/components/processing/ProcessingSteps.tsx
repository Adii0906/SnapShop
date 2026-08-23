"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepStatus = "pending" | "active" | "done";

export function ProcessingSteps({
  steps,
  statuses,
}: {
  steps: string[];
  statuses: StepStatus[];
}) {
  return (
    <ol className="space-y-1">
      {steps.map((label, i) => {
        const status = statuses[i];
        return (
          <motion.li
            key={label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: status === "pending" ? 0.4 : 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 py-1.5"
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                status === "done" && "border-success bg-success-dim text-success",
                status === "active" && "border-marigold text-marigold-ink",
                status === "pending" && "border-line text-ink-soft"
              )}
            >
              {status === "done" && <Check className="h-3 w-3" strokeWidth={3} />}
              {status === "active" && <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2.5} />}
            </span>
            <span
              className={cn(
                "text-sm font-mono",
                status === "done" && "text-ink-soft",
                status === "active" && "text-ink font-medium",
                status === "pending" && "text-ink-soft"
              )}
            >
              {label}
            </span>
          </motion.li>
        );
      })}
    </ol>
  );
}
