"use client";

import { Settings } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { DashboardState } from "@/components/dashboard/DashboardState";
import { updateBusiness } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { business, loading, error, refresh } = useDashboard();

  if (loading || error || !business) return <DashboardState loading={loading} error={error} />;

  async function togglePublished() {
    await updateBusiness(business!.slug, { is_published: !business!.is_published });
    await refresh();
  }

  return (
    <div className="p-8 max-w-lg">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">Settings</p>
      <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight flex items-center gap-2">
        <Settings className="h-5 w-5" /> Store settings
      </h1>

      <div className="mt-6 rounded-lg border border-line p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Store visibility</p>
          <p className="text-sm text-ink-soft mt-0.5">
            {business.is_published ? "Live - customers can view your storefront." : "Unpublished - the storefront page is hidden."}
          </p>
        </div>
        <Button variant={business.is_published ? "outline" : "accent"} onClick={togglePublished}>
          {business.is_published ? "Unpublish" : "Publish"}
        </Button>
      </div>

      <p className="mt-6 text-sm text-ink-soft">
        Store slug: <code className="font-mono bg-paper-dim px-1.5 py-0.5 rounded-sm">{business.slug}</code>
      </p>
    </div>
  );
}
