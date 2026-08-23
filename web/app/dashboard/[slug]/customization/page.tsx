"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { DashboardState } from "@/components/dashboard/DashboardState";
import { updateBusiness } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listTemplates } from "@/lib/api";
import type { StoreTemplate } from "@/lib/types";

const FIELDS: { key: keyof FormState; label: string; placeholder?: string }[] = [
  { key: "name", label: "Store name" },
  { key: "description", label: "Description" },
  { key: "phone", label: "Phone" },
  { key: "whatsapp", label: "WhatsApp number" },
  { key: "address", label: "Address" },
  { key: "logo_url", label: "Logo URL", placeholder: "https://..." },
  { key: "banner_url", label: "Banner URL", placeholder: "https://..." },
  { key: "hero_title", label: "Hero title" },
  { key: "hero_subtitle", label: "Hero subtitle" },
];

interface FormState {
  name: string;
  description: string;
  phone: string;
  whatsapp: string;
  address: string;
  logo_url: string;
  banner_url: string;
  hero_title: string;
  hero_subtitle: string;
  primary_color: string;
  accent_color: string;
  template: string;
}

export default function CustomizationPage() {
  const { business, loading, error, refresh } = useDashboard();
  const [form, setForm] = useState<FormState | null>(null);
  const [templates, setTemplates] = useState<StoreTemplate[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (business) {
      setForm({
        name: business.name,
        description: business.description || "",
        phone: business.phone || "",
        whatsapp: business.whatsapp || "",
        address: business.address || "",
        logo_url: business.logo_url || "",
        banner_url: business.banner_url || "",
        hero_title: business.hero_title || "",
        hero_subtitle: business.hero_subtitle || "",
        primary_color: business.primary_color,
        accent_color: business.accent_color,
        template: business.template,
      });
    }
  }, [business]);

  useEffect(() => {
    listTemplates().then(setTemplates).catch(() => {});
  }, []);

  if (loading || error || !business || !form) return <DashboardState loading={loading} error={error} />;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!form) return;
    setIsSaving(true);
    try {
      await updateBusiness(business!.slug, form);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">Store Customization</p>
      <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">Customize your store</h1>

      <div className="mt-6 grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium text-ink-soft">{f.label}</label>
              <Input
                className="mt-1"
                value={form[f.key] as string}
                placeholder={f.placeholder}
                onChange={(e) => set(f.key, e.target.value as FormState[typeof f.key])}
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-ink-soft">Primary color</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={form.primary_color}
                  onChange={(e) => set("primary_color", e.target.value)}
                  className="h-10 w-10 rounded-md border border-line"
                />
                <Input value={form.primary_color} onChange={(e) => set("primary_color", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-ink-soft">Accent color</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={form.accent_color}
                  onChange={(e) => set("accent_color", e.target.value)}
                  className="h-10 w-10 rounded-md border border-line"
                />
                <Input value={form.accent_color} onChange={(e) => set("accent_color", e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ink-soft">Template</label>
            <select
              value={form.template}
              onChange={(e) => set("template", e.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-line bg-paper px-3 text-sm focus-ring"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <Button variant="accent" size="lg" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>

        <div>
          <p className="text-xs font-medium text-ink-soft mb-2">Live preview</p>
          <div className="rounded-lg border border-line overflow-hidden sticky top-8">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between">
              <span className="font-display font-semibold">{form.name}</span>
              <span className="text-xs text-ink-soft">Cart</span>
            </div>
            <div className="p-8" style={{ backgroundColor: `${form.primary_color}0d` }}>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                {form.hero_title || form.name}
              </h2>
              {form.hero_subtitle && <p className="mt-2 text-sm text-ink-soft">{form.hero_subtitle}</p>}
              <button
                className="mt-4 rounded-md px-4 py-2 text-sm font-medium"
                style={{ backgroundColor: form.accent_color, color: "#16151A" }}
              >
                Shop now
              </button>
            </div>
            <div className="p-5 text-xs text-ink-soft space-y-1">
              {form.address && <p>{form.address}</p>}
              {form.phone && <p>{form.phone}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
