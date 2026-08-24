"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ProcessingSteps, type StepStatus } from "@/components/processing/ProcessingSteps";
import { Button } from "@/components/ui/button";
import { uploadPamphlet } from "@/lib/api";
import { takePendingUpload, type PendingUpload } from "@/lib/pending-upload";
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

export default function ProcessingPage() {
  const router = useRouter();
  const takenRef = useRef(false);
  const [pending, setPending] = useState<PendingUpload | null>(null);
  const [missing, setMissing] = useState(false);

  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  // Real upload progress (0-1) for a real pamphlet file; null when there's
  // nothing to upload (Demo Mode) or once the upload itself has finished.
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Pick up the file + Demo Mode choice handed off from /upload. Guarded
  // against React StrictMode's double-invoked effects, since the module
  // singleton can only be taken once.
  useEffect(() => {
    if (takenRef.current) return;
    takenRef.current = true;
    const p = takePendingUpload();
    if (!p) {
      setMissing(true);
      return;
    }
    setPending(p);
  }, []);

  useEffect(() => {
    if (missing) router.replace("/upload");
  }, [missing, router]);

  useEffect(() => {
    if (!pending) return;
    const trackProgress = !pending.demoMode && !!pending.file;
    setError(null);
    setResult(null);
    setStepIndex(0);
    setUploadProgress(trackProgress ? 0 : null);
    uploadPamphlet(
      {
        demoMode: pending.demoMode,
        demoBusinessSlug: pending.demoBusinessSlug,
        file: pending.file,
      },
      trackProgress ? (fraction) => setUploadProgress(fraction) : undefined
    )
      .then((data) => {
        setUploadProgress((p) => (p === null ? null : 1));
        setResult(data);
      })
      .catch((err) => {
        setUploadProgress((p) => (p === null ? null : 1));
        setError(err instanceof Error ? err.message : "Extraction failed");
      });
  }, [pending, attempt]);

  useEffect(() => {
    if (error) return;
    if (stepIndex >= STEPS.length - 1) return;
    const t = setTimeout(() => setStepIndex((i) => i + 1), STEP_DURATION_MS);
    return () => clearTimeout(t);
  }, [stepIndex, error]);

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

  function handleRetry() {
    setAttempt((a) => a + 1);
  }

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
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border border-danger/40 bg-danger-dim p-5 text-sm text-danger"
          >
            <p>{error}</p>
            <div className="mt-4 flex items-center gap-4">
              <Button variant="accent" size="sm" onClick={handleRetry}>
                Retry
              </Button>
              <Link href="/upload" className="underline">
                Go back and try again
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            {uploadProgress !== null && uploadProgress < 1 && (
              <div className="mb-6">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-dim">
                  <motion.div
                    className="h-full rounded-full bg-marigold"
                    animate={{ width: `${Math.round(uploadProgress * 100)}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <p className="mt-1.5 font-mono text-xs text-ink-soft">
                  Uploading pamphlet - {Math.round(uploadProgress * 100)}%
                </p>
              </div>
            )}
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
