"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { DashboardProvider } from "@/lib/dashboard-context";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { markStoreOwned } from "@/lib/store-ownership";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { slug } = useParams<{ slug: string }>();

  // Reaching the dashboard for a slug at all is itself the ownership
  // signal (see lib/store-ownership.ts) - covers a seller returning via a
  // bookmarked dashboard link, not just the store-ready redirect.
  useEffect(() => {
    if (slug) markStoreOwned(slug);
  }, [slug]);

  return (
    <DashboardProvider slug={slug}>
      <div className="min-h-screen flex bg-paper text-ink">
        <DashboardSidebar slug={slug} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </DashboardProvider>
  );
}
