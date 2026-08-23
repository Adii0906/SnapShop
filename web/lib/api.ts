import type {
  AssistantAction,
  AssistantChatResponse,
  BusinessDetail,
  CreatedBusiness,
  ExtractionResult,
  ExtractedOffer,
  ExtractedProduct,
  Product,
  StoreTemplate,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = text || res.statusText;
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.detail === "string") message = parsed.detail;
    } catch {
      // response wasn't JSON - fall back to the raw text above
    }
    throw new Error(message);
  }
  return res.json();
}

export interface UploadPamphletParams {
  /** Explicit, user-controlled choice - never inferred or defaulted client-side. */
  demoMode: boolean;
  demoBusinessSlug?: string;
  file?: File | null;
}

export async function uploadPamphlet({
  demoMode,
  demoBusinessSlug,
  file,
}: UploadPamphletParams): Promise<ExtractionResult> {
  const form = new FormData();
  form.append("demo_mode", String(demoMode));
  if (demoBusinessSlug) form.append("demo_business", demoBusinessSlug);
  if (file) form.append("file", file);
  const res = await fetch(`${API_URL}/api/upload`, { method: "POST", body: form });
  return json<ExtractionResult>(res);
}

export async function listTemplates(): Promise<StoreTemplate[]> {
  const res = await fetch(`${API_URL}/api/templates`);
  return json<StoreTemplate[]>(res);
}

export async function recommendTemplate(category: string): Promise<{ recommended: string; template: StoreTemplate }> {
  const res = await fetch(`${API_URL}/api/templates/recommend?category=${encodeURIComponent(category)}`);
  return json(res);
}

export interface FinalizePayload {
  business: ExtractionResult["business"];
  products: ExtractedProduct[];
  offers: ExtractedOffer[];
  template: string;
  theme?: string;
}

export async function finalizeStore(payload: FinalizePayload): Promise<CreatedBusiness> {
  const res = await fetch(`${API_URL}/api/businesses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return json<CreatedBusiness>(res);
}

export async function getBusiness(slug: string): Promise<BusinessDetail> {
  const res = await fetch(`${API_URL}/api/businesses/${slug}`, { cache: "no-store" });
  return json<BusinessDetail>(res);
}

export interface BusinessUpdatePayload {
  name?: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  logo_url?: string;
  banner_url?: string;
  primary_color?: string;
  accent_color?: string;
  hero_title?: string;
  hero_subtitle?: string;
  template?: string;
  is_published?: boolean;
}

export async function updateBusiness(slug: string, payload: BusinessUpdatePayload): Promise<BusinessDetail> {
  const res = await fetch(`${API_URL}/api/businesses/${slug}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return json<BusinessDetail>(res);
}

export async function uploadProductImage(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/api/media/images`, { method: "POST", body: form });
  return json<{ url: string }>(res);
}

export interface ProductCreatePayload {
  name: string;
  price: number;
  category: string;
  description?: string;
  confidence?: number;
  stock?: number;
  image_url?: string | null;
}

export async function createProduct(slug: string, payload: ProductCreatePayload): Promise<Product> {
  const res = await fetch(`${API_URL}/api/businesses/${slug}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return json<Product>(res);
}

export interface ProductUpdatePayload {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  stock?: number;
  is_published?: boolean;
  image_url?: string | null;
}

export async function updateProduct(slug: string, productId: string, payload: ProductUpdatePayload): Promise<Product> {
  const res = await fetch(`${API_URL}/api/businesses/${slug}/products/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return json<Product>(res);
}

export async function deleteProduct(slug: string, productId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/businesses/${slug}/products/${productId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`API error ${res.status}`);
}

export async function addOffer(slug: string, payload: ExtractedOffer): Promise<BusinessDetail> {
  const res = await fetch(`${API_URL}/api/businesses/${slug}/offers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return json<BusinessDetail>(res);
}

export async function updateOffer(slug: string, offerId: string, payload: Partial<ExtractedOffer>): Promise<BusinessDetail> {
  const res = await fetch(`${API_URL}/api/businesses/${slug}/offers/${offerId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return json<BusinessDetail>(res);
}

export async function deleteOffer(slug: string, offerId: string): Promise<BusinessDetail> {
  const res = await fetch(`${API_URL}/api/businesses/${slug}/offers/${offerId}`, { method: "DELETE" });
  return json<BusinessDetail>(res);
}

export async function chatWithAssistant(
  slug: string,
  payload: { message?: string; confirm?: AssistantAction }
): Promise<AssistantChatResponse> {
  const res = await fetch(`${API_URL}/api/businesses/${slug}/assistant/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return json<AssistantChatResponse>(res);
}
