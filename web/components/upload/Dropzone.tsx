"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Matches ALLOWED_PAMPHLET_CONTENT_TYPES in apps/api/app/routers/upload.py -
// PDF isn't supported by the OCR service yet, so it's rejected client-side
// with a clear message instead of round-tripping to the server first.
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB, matches the backend limit

export function Dropzone({
  file,
  previewUrl,
  onFile,
  onClear,
  onRejected,
}: {
  file: File | null;
  previewUrl: string | null;
  onFile: (file: File) => void;
  onClear: () => void;
  onRejected?: (message: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const f = files?.[0];
      if (!f) return;
      if (!ACCEPTED.includes(f.type)) {
        onRejected?.("Unsupported file type. Upload a JPG, PNG, or WEBP photo of the pamphlet.");
        return;
      }
      if (f.size > MAX_BYTES) {
        onRejected?.("Image is too large (max 10MB). Try a smaller photo.");
        return;
      }
      onFile(f);
    },
    [onFile, onRejected]
  );

  if (file) {
    const isImage = file.type.startsWith("image/");
    return (
      <div className="rounded-lg border border-line bg-paper p-5">
        <div className="flex items-start gap-4">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-line bg-paper-dim flex items-center justify-center">
            {isImage && previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Pamphlet preview" className="h-full w-full object-cover" />
            ) : (
              <FileText className="h-8 w-8 text-ink-soft" strokeWidth={1.5} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="mt-1 text-xs text-ink-soft font-mono">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="rounded-sm p-1.5 text-ink-soft hover:bg-paper-dim hover:text-ink focus-ring"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-16 text-center transition-colors cursor-pointer focus-ring",
        isDragging ? "border-marigold bg-marigold-dim/40" : "border-line bg-paper-dim/30 hover:border-ink-soft"
      )}
    >
      <div className="rounded-full bg-paper p-3 border border-line">
        <Upload className="h-5 w-5 text-ink-soft" strokeWidth={1.75} />
      </div>
      <p className="text-sm font-medium">Drag and drop your pamphlet here</p>
      <p className="text-xs text-ink-soft">or click to browse - JPG, PNG or WEBP</p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
