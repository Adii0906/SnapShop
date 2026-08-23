import { Warehouse } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function InventoryPage() {
  return (
    <ComingSoon
      icon={Warehouse}
      eyebrow="Inventory"
      title="Stock is editable from Products for now"
      description="Low-stock alerts and bulk stock adjustments will live here. Use the Products page to update stock per item today."
    />
  );
}
