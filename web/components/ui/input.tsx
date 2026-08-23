import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md border border-line bg-paper px-3 text-sm text-ink placeholder:text-ink-soft focus-ring",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
