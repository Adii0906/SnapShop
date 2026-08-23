"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, LayoutDashboard, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

function StoreReadyInner() {
  const slug = useSearchParams().get("slug") || "";

  return (
    <main className="min-h-screen bg-paper text-ink flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <CheckCircle2 className="h-10 w-10 text-success mx-auto" strokeWidth={1.5} />
        <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight">
          Your store is live
        </h1>
        <p className="mt-3 text-ink-soft font-mono text-sm">
          /store/{slug}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3">
          <Link href={`/store/${slug}`} className="w-full">
            <Button variant="accent" size="lg" className="w-full">
              <Store className="h-4 w-4" /> View your store
            </Button>
          </Link>
          <Link href={`/dashboard/${slug}`} className="w-full">
            <Button variant="outline" size="lg" className="w-full">
              <LayoutDashboard className="h-4 w-4" /> Go to seller dashboard
            </Button>
          </Link>
          <Link href="/upload" className="text-sm text-ink-soft underline underline-offset-4 mt-1">
            Try another pamphlet
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function StoreReadyPage() {
  return (
    <Suspense fallback={null}>
      <StoreReadyInner />
    </Suspense>
  );
}
