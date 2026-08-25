"use client";

import { useParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { DashboardProvider } from "@/lib/dashboard-context";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const pathname = usePathname();

  return (
    <DashboardProvider slug={slug}>
      <div className="min-h-screen flex bg-paper text-ink">
        <DashboardSidebar slug={slug} />
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 min-w-0"
        >
          {children}
        </motion.div>
      </div>
    </DashboardProvider>
  );
}
