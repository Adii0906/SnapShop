"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Package, Percent, Phone, Tag } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { DashboardState } from "@/components/dashboard/DashboardState";
import { Badge } from "@/components/ui/badge";

export default function OverviewPage() {
  const { business, loading, error } = useDashboard();

  if (loading || error || !business) {
    return <DashboardState loading={loading} error={error} />;
  }

  const published = business.products.filter((p) => p.is_published).length;
  const recentProducts = business.products.slice(0, 5);
  const hasContactInfo = business.phone || business.whatsapp || business.address;

  return (
    <div className="p-8 max-w-4xl">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">Overview</p>
      <div className="mt-1 flex items-center gap-2.5">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{business.name}</h1>
        <Badge variant={business.is_published ? "success" : "neutral"}>
          {business.is_published ? "Live" : "Unpublished"}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-ink-soft">{business.category} store - {business.template} template</p>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Products" value={business.products.length} />
        <StatCard icon={Tag} label="Categories" value={business.categories.length} />
        <StatCard icon={Percent} label="Offers" value={business.offers.length} />
        <StatCard icon={Package} label="Published" value={published} />
      </div>

      {hasContactInfo && (
        <div className="mt-8 rounded-lg border border-line p-5">
          <p className="text-sm font-medium">Store information</p>
          <div className="mt-3 space-y-1.5 text-sm text-ink-soft">
            {business.phone && (
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} /> {business.phone}
              </p>
            )}
            {business.whatsapp && (
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} /> {business.whatsapp} (WhatsApp)
              </p>
            )}
            {business.address && (
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} /> {business.address}
              </p>
            )}
          </div>
        </div>
      )}

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

      {recentProducts.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Products</p>
            <Link
              href={`/dashboard/${business.slug}/products`}
              className="text-sm text-marigold-ink hover:underline underline-offset-2"
            >
              View all
            </Link>
          </div>
          <div className="mt-3 rounded-lg border border-line divide-y divide-line overflow-hidden">
            {recentProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-paper-dim/40">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.name} className="h-9 w-9 rounded-md object-cover border border-line shrink-0" />
                ) : (
                  <div className="h-9 w-9 rounded-md border border-line bg-paper-dim/50 shrink-0" />
                )}
                <span className="flex-1 min-w-0 truncate text-sm">{p.name}</span>
                <span className="font-mono text-sm text-ink-soft shrink-0">Rs. {p.price}</span>
                <Badge variant={p.is_published ? "success" : "neutral"} className="shrink-0">
                  {p.is_published ? "Published" : "Hidden"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
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
