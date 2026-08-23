/**
 * Hands the file + Demo Mode choice from the /upload page to /processing.
 *
 * Both pages are client-navigated within the same Next.js app (router.push,
 * not a full page load), so a module-level singleton survives the
 * transition - unlike sessionStorage, it can hold a real File object.
 */
export interface PendingUpload {
  demoMode: boolean;
  demoBusinessSlug: string;
  file: File | null;
}

let pending: PendingUpload | null = null;

export function setPendingUpload(value: PendingUpload) {
  pending = value;
}

export function takePendingUpload(): PendingUpload | null {
  const value = pending;
  pending = null;
  return value;
}
