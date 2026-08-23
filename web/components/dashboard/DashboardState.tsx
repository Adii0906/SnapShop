import { Loader2 } from "lucide-react";

export function DashboardState({ loading, error }: { loading: boolean; error: string | null }) {
  return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin text-ink-soft" />
      ) : (
        <p className="text-sm text-danger">{error || "Store not found."}</p>
      )}
    </div>
  );
}
