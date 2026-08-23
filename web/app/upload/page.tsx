"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/upload/Dropzone";
import { DEMO_BUSINESSES } from "@/lib/types";
import { cn } from "@/lib/utils";

function UploadPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demoParam = searchParams.get("demo");

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [simulateAs, setSimulateAs] = useState<string>(
    DEMO_BUSINESSES.some((d) => d.slug === demoParam) ? demoParam! : "royal-fashion"
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFile(f: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
  }

  function handleClear() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
  }

  function handleContinue() {
    router.push(`/processing?demo=${simulateAs}`);
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

        <div className="mt-10 rounded-lg border border-line bg-paper-dim/40 p-5">
          <p className="text-sm font-medium">Demo mode</p>
          <p className="mt-1 text-sm text-ink-soft">
            This build runs on seeded sample data instead of live OCR. Pick which
            sample pamphlet to extract from - the file above is just for preview.
          </p>
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
        </div>

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
