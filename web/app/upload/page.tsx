"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/upload/Dropzone";
import { DEMO_BUSINESSES } from "@/lib/types";
import { setPendingUpload } from "@/lib/pending-upload";
import { cn } from "@/lib/utils";

function UploadPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demoParam = searchParams.get("demo");
  const linkedDemoSlug = DEMO_BUSINESSES.some((d) => d.slug === demoParam) ? demoParam! : null;

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Demo Mode is explicit and user-controlled: only pre-enabled when the
  // user arrived via a "Try this demo" link from the landing page.
  const [demoMode, setDemoMode] = useState(linkedDemoSlug !== null);
  const [simulateAs, setSimulateAs] = useState<string>(linkedDemoSlug ?? "royal-fashion");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFile(f: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
    setFormError(null);
  }

  function handleClear() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
  }

  function handleContinue() {
    if (!demoMode && !file) {
      setFormError("Upload a pamphlet photo before continuing, or turn on Demo Mode.");
      return;
    }
    setFormError(null);
    setPendingUpload({ demoMode, demoBusinessSlug: simulateAs, file });
    router.push("/processing");
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="mx-auto max-w-3xl px-6 py-6 flex items-center justify-between">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          SnapShop
        </Link>
        <span className="font-mono text-xs text-ink-soft">Step 1 of 4</span>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
          Upload your pamphlet
        </h1>
        <p className="mt-2 text-ink-soft">
          A phone photo works fine. SnapShop reads it the way a person would.
        </p>

        <div className="mt-8">
          <Dropzone file={file} previewUrl={previewUrl} onFile={handleFile} onClear={handleClear} />
        </div>

        {!demoMode && (
          <p className="mt-3 text-sm text-ink-soft">
            Your upload will go through the real pipeline: PaddleOCR reads the
            image, then AI extracts products, prices, categories and business
            details.
          </p>
        )}

        <div className="mt-10 rounded-lg border border-line bg-paper-dim/40 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Demo mode</p>
              <p className="mt-1 text-sm text-ink-soft">
                Skip your upload and run the flow on seeded sample data instead.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={demoMode}
              onClick={() => setDemoMode((v) => !v)}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full border transition-colors focus-ring",
                demoMode ? "border-marigold bg-marigold" : "border-line bg-paper"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-paper shadow transition-transform",
                  demoMode ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {demoMode && (
            <div className="mt-4 flex flex-wrap gap-2">
              {DEMO_BUSINESSES.map((d) => (
                <button
                  key={d.slug}
                  type="button"
                  onClick={() => setSimulateAs(d.slug)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-left text-sm transition-colors focus-ring",
                    simulateAs === d.slug
                      ? "border-marigold bg-marigold-dim/50"
                      : "border-line bg-paper hover:border-ink-soft"
                  )}
                >
                  <span className="block font-medium">{d.label}</span>
                  <span className="block text-xs text-ink-soft">{d.hint}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {formError && (
          <p className="mt-4 text-sm text-danger" role="alert">
            {formError}
          </p>
        )}

        <div className="mt-10 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
          <Button variant="accent" size="lg" onClick={handleContinue}>
            Continue - Extract Information <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </main>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={null}>
      <UploadPageInner />
    </Suspense>
  );
}
