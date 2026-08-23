import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-mono font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-paper-dim text-ink-soft",
        accent: "bg-marigold-dim text-marigold-ink",
        success: "bg-success-dim text-success",
        warning: "bg-warning-dim text-warning",
        danger: "bg-danger-dim text-danger",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
