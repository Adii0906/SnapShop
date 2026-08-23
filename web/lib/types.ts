export interface ExtractionBusiness {
  name: string;
  category: string;
  phone: string;
  whatsapp: string;
  address: string;
  description: string;
}

export interface ExtractedProduct {
  name: string;
  price: number;
  category: string;
  description: string;
  confidence: number;
  stock: number;
  image_url?: string | null;
}

export interface ExtractedOffer {
  title: string;
  description: string;
}

export interface ExtractionStats {
  products: number;
  categories: number;
  offers: number;
  businesses: number;
}

export interface ExtractionResult {
  business: ExtractionBusiness;
  products: ExtractedProduct[];
  offers: ExtractedOffer[];
  stats: ExtractionStats;
}

export interface StoreTemplate {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  price: number;
  description: string;
  confidence: number;
  category_id: string | null;
  category_name: string | null;
  stock: number;
  is_published: boolean;
  image_url?: string | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
}

export interface BusinessDetail {
  id: string;
  slug: string;
  name: string;
  category: string;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  template: string;
  theme: string;
  primary_color: string;
  accent_color: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  is_published: boolean;
  categories: Category[];
  products: Product[];
  offers: Offer[];
}

export type CreatedBusiness = BusinessDetail;

export interface CartLine {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export interface AssistantAction {
  tool: string;
  params: Record<string, unknown>;
  summary: string;
}

export interface AssistantChatResponse {
  reply: string;
  pending: AssistantAction | null;
  products: Product[];
}

export const DEMO_BUSINESSES = [
  { slug: "royal-fashion", label: "Royal Fashion", hint: "Fashion pamphlet" },
  { slug: "spice-corner", label: "Spice Corner", hint: "Restaurant menu" },
  { slug: "freshmart", label: "FreshMart", hint: "Grocery flyer" },
] as const;
