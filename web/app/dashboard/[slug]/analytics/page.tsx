import { BarChart3 } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function AnalyticsPage() {
  return (
    <ComingSoon
      icon={BarChart3}
      eyebrow="Analytics"
      title="Numbers need real orders first"
      description="Once orders are captured in the database instead of going straight to WhatsApp, this page will chart sales, top products and repeat customers."
    />
  );
}
