"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ProcessingSteps, type StepStatus } from "@/components/processing/ProcessingSteps";
import { uploadPamphlet } from "@/lib/api";
import type { ExtractionResult } from "@/lib/types";

const STEPS = [
  "Pamphlet uploaded",
  "Image preprocessing",
  "PaddleOCR reading pamphlet",
  "Extracting products",
  "Detecting prices",
  "Detecting categories",
  "Understanding business",
  "Preparing your store",
];

const STEP_DURATION_MS = 550;

function ProcessingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demoSlug = searchParams.get("demo") || "royal-fashion";

  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<ExtractionResult | null>(null);

  useEffect(() => {
    uploadPamphlet(demoSlug)
      .then((data) => {
        resultRef.current = data;
        setResult(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Extraction failed"));
  }, [demoSlug]);

  useEffect(() => {
    if (stepIndex >= STEPS.length - 1) return;
    const t = setTimeout(() => setStepIndex((i) => i + 1), STEP_DURATION_MS);
    return () => clearTimeout(t);
  }, [stepIndex]);

  const allStepsShown = stepIndex >= STEPS.length - 1;
  const ready = allStepsShown && result;

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      sessionStorage.setItem("snapshop:extraction", JSON.stringify(result));
      sessionStorage.setItem("shopsnap:extraction", JSON.stringify(result));
      router.push("/review");
    }, 900);
    return () => clearTimeout(t);
  }, [ready, result, router]);

  const statuses: StepStatus[] = STEPS.map((_, i) => {
    if (i < stepIndex) return "done";
    if (i === stepIndex) return ready ? "done" : "active";
    return "pending";
  });

  return (
    <main className="min-h-screen bg-paper text-ink flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-soft mb-2">
          Step 2 of 4
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight mb-8">
          Reading your pamphlet
        </h1>

        {error ? (
          <div className="rounded-lg border border-danger/40 bg-danger-dim p-5 text-sm text-danger">
            {error}. <Link href="/upload" className="underline">Go back and try again</Link>.
          </div>
        ) : (
          <>
            <ProcessingSteps steps={STEPS} statuses={statuses} />

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-8 grid grid-cols-2 gap-3"
              >
                <StatChip label="Products Found" value={result.stats.products} />
                <StatChip label="Categories" value={result.stats.categories} />
                <StatChip label="Offers" value={result.stats.offers} />
                <StatChip label="Business" value={result.stats.businesses} />
              </motion.div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-line bg-paper-dim/40 px-4 py-3">
      <div className="font-mono text-2xl font-semibold text-ink">{value}</div>
      <div className="text-xs text-ink-soft mt-0.5">{label}</div>
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={null}>
      <ProcessingPageInner />
    </Suspense>
  );
}
