"use client";

import Link from "next/link";
import { ArrowRight, Package, Percent, Tag } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { DashboardState } from "@/components/dashboard/DashboardState";

export default function OverviewPage() {
  const { business, loading, error } = useDashboard();

  if (loading || error || !business) {
    return <DashboardState loading={loading} error={error} />;
  }

  const published = business.products.filter((p) => p.is_published).length;

  return (
    <div className="p-8 max-w-4xl">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">Overview</p>
      <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">{business.name}</h1>
      <p className="mt-1 text-sm text-ink-soft">{business.category} store - {business.template} template</p>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Products" value={business.products.length} />
        <StatCard icon={Tag} label="Categories" value={business.categories.length} />
        <StatCard icon={Percent} label="Offers" value={business.offers.length} />
        <StatCard icon={Package} label="Published" value={published} />
      </div>

      <div className="mt-10 grid sm:grid-cols-2 gap-4">
        <Link
          href={`/dashboard/${business.slug}/products`}
          className="group rounded-lg border border-line p-5 hover:border-ink-soft transition-colors"
        >
          <p className="font-medium">Manage products</p>
          <p className="mt-1 text-sm text-ink-soft">Edit prices, stock and categories.</p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm text-marigold-ink">
            Go to products <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
        <Link
          href={`/dashboard/${business.slug}/customization`}
          className="group rounded-lg border border-line p-5 hover:border-ink-soft transition-colors"
        >
          <p className="font-medium">Customize your store</p>
          <p className="mt-1 text-sm text-ink-soft">Branding, contact details and hero copy.</p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm text-marigold-ink">
            Go to customization <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line p-4">
      <Icon className="h-4 w-4 text-ink-soft" strokeWidth={1.75} />
      <div className="mt-3 font-mono text-2xl font-semibold">{value}</div>
      <div className="text-xs text-ink-soft mt-0.5">{label}</div>
    </div>
  );
}
