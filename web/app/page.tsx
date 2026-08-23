import Link from "next/link";
import { FileText, ScanLine, Sparkles, Store, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroScan } from "@/components/landing/HeroScan";

const PIPELINE = [
  { icon: FileText, label: "Pamphlet" },
  { icon: ScanLine, label: "OCR" },
  { icon: Sparkles, label: "AI" },
  { icon: Store, label: "Online Store" },
];

const DEMOS = [
  {
    slug: "royal-fashion",
    name: "Royal Fashion",
    category: "Fashion",
    sample: "Men's Formal Shirt - Rs.799",
  },
  {
    slug: "spice-corner",
    name: "Spice Corner",
    category: "Restaurant",
    sample: "Masala Dosa - Rs.120",
  },
  {
    slug: "freshmart",
    name: "FreshMart",
    category: "Grocery",
    sample: "Rice 5kg - Rs.450",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <span className="font-display text-lg font-semibold tracking-tight">SnapShop</span>
        <Link href="/upload">
          <Button variant="outline" size="sm">Create My Store</Button>
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-soft mb-5">
            Built for shop owners, not developers
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.08] tracking-tight text-balance">
            Turn your pamphlet into an online store.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-ink-soft max-w-lg leading-relaxed">
            Upload your existing shop pamphlet and let SnapShop extract your products,
            prices and business information automatically.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link href="/upload">
              <Button variant="accent" size="lg">
                Create My Store <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-14 flex items-center gap-1.5 flex-wrap">
            {PIPELINE.map((step, i) => (
              <div key={step.label} className="flex items-center gap-1.5">
                <div className="flex items-center gap-2 rounded-md border border-line bg-paper-dim/50 px-3 py-2">
                  <step.icon className="h-4 w-4 text-marigold-ink" strokeWidth={1.75} />
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
                {i < PIPELINE.length - 1 && (
                  <ArrowRight className="h-3.5 w-3.5 text-ink-soft shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        <HeroScan />
      </section>

      <section className="border-t border-line bg-paper-dim/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            See it before you upload anything
          </h2>
          <p className="mt-2 text-ink-soft max-w-lg">
            Three sample pamphlets, already processed. Pick one to walk through the
            full flow with real extracted data.
          </p>

          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {DEMOS.map((demo) => (
              <Link
                key={demo.slug}
                href={`/upload?demo=${demo.slug}`}
                className="group rounded-lg border border-line bg-paper p-5 transition-colors hover:border-marigold focus-ring"
              >
                <span className="inline-block rounded-sm bg-paper-dim px-2 py-0.5 text-[11px] font-mono text-ink-soft">
                  {demo.category}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold">{demo.name}</h3>
                <p className="mt-1 text-sm text-ink-soft font-mono">{demo.sample}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-marigold-ink">
                  Try this demo
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 flex items-center justify-between text-sm text-ink-soft">
        <span>SnapShop</span>
        <span>Pamphlet in, storefront out.</span>
      </footer>
    </main>
  );
}
