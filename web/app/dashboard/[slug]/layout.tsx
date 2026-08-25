"use client";

import { useParams } from "next/navigation";
import { DashboardProvider } from "@/lib/dashboard-context";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { slug } = useParams<{ slug: string }>();

  return (
    <DashboardProvider slug={slug}>
      <div className="min-h-screen flex bg-paper text-ink">
        <DashboardSidebar slug={slug} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </DashboardProvider>
  );
}
