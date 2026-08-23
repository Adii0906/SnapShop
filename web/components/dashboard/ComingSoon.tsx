import type { LucideIcon } from "lucide-react";

export function ComingSoon({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">{eyebrow}</p>
      <div className="mt-8 max-w-md rounded-lg border border-dashed border-line p-8 text-center">
        <Icon className="h-6 w-6 text-ink-soft mx-auto" strokeWidth={1.5} />
        <p className="mt-4 font-display text-lg font-semibold">{title}</p>
        <p className="mt-2 text-sm text-ink-soft">{description}</p>
      </div>
    </div>
  );
}
