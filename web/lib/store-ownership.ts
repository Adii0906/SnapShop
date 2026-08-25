/**
 * Lightweight, client-only "is this browser the store's owner" signal.
 *
 * The app has no login/auth system, so this isn't real access control -
 * it only decides whether to show the seller navigation overlay on the
 * public storefront. A slug is marked owned when this browser creates a
 * store or visits its dashboard; the storefront reads that to decide
 * whether a visitor is (probably) the seller versus a random customer.
 */
const STORAGE_KEY = "snapshop:owned-stores";

function readOwnedSlugs(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function markStoreOwned(slug: string): void {
  if (!slug) return;
  try {
    const owned = new Set(readOwnedSlugs());
    owned.add(slug);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...owned]));
  } catch {
    // localStorage unavailable (private browsing, etc.) - safe to no-op
  }
}

export function isStoreOwned(slug: string): boolean {
  if (!slug) return false;
  try {
    return readOwnedSlugs().includes(slug);
  } catch {
    return false;
  }
}
