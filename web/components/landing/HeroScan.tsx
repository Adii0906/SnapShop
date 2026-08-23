"use client";

import { motion } from "framer-motion";

const LINES = [92, 68, 80, 55, 74];
const CHIPS = [
  { label: "Men's Formal Shirt", value: "Rs.799" },
  { label: "Men's Slim Jeans", value: "Rs.1,299" },
  { label: "Sports Shoes", value: "Rs.1,999" },
  { label: "Category: Shirts", value: "98%" },
];

export function HeroScan() {
  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0" aria-hidden="true">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Pamphlet */}
        <div className="relative rounded-md border border-line bg-paper-dim/60 p-4 h-56 overflow-hidden">
          <div className="text-[10px] font-mono uppercase tracking-wide text-ink-soft mb-3">
            pamphlet.jpg
          </div>
          <div className="space-y-2.5">
            {LINES.map((w, i) => (
              <div
                key={i}
                className="h-2 rounded-full bg-ink/15"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
          <motion.div
            className="absolute left-0 right-0 h-10"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(214,146,46,0.35) 50%, transparent 100%)",
            }}
            initial={{ top: "-10%" }}
            animate={{ top: ["-10%", "105%"] }}
            transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
          />
        </div>

        {/* Arrow */}
        <div className="hidden sm:block text-ink-soft text-lg font-display">&#8594;</div>

        {/* Extracted chips */}
        <div className="flex flex-col gap-2">
          {CHIPS.map((chip, i) => (
            <motion.div
              key={chip.label}
              className="flex items-center justify-between gap-2 rounded-sm border border-line bg-paper px-2.5 py-1.5 text-xs"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.6 + i * 0.35,
                repeat: Infinity,
                repeatDelay: 3.4,
                ease: "easeOut",
              }}
            >
              <span className="truncate text-ink-soft">{chip.label}</span>
              <span className="font-mono font-medium text-ink shrink-0">{chip.value}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
