"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getBusiness } from "./api";
import type { BusinessDetail } from "./types";

interface DashboardContextValue {
  business: BusinessDetail | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setBusiness: (b: BusinessDetail) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ slug, children }: { slug: string; children: React.ReactNode }) {
  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getBusiness(slug);
      setBusiness(data);
      setError(null);
    } catch {
      setError("Could not load this store. Is the API server running?");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <DashboardContext.Provider value={{ business, loading, error, refresh, setBusiness }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
