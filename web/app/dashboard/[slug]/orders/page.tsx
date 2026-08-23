import { ShoppingCart } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function OrdersPage() {
  return (
    <ComingSoon
      icon={ShoppingCart}
      eyebrow="Orders"
      title="Order history is next"
      description="Checkout currently hands orders straight to your WhatsApp. An orders table with status tracking is the next build pass."
    />
  );
}
