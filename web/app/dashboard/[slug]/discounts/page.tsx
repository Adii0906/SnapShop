"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { DashboardState } from "@/components/dashboard/DashboardState";
import { addOffer, deleteOffer, updateOffer } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Offer } from "@/lib/types";

export default function DiscountsPage() {
  const { business, loading, error, refresh } = useDashboard();

  if (loading || error || !business) return <DashboardState loading={loading} error={error} />;

  async function handleAdd() {
    await addOffer(business!.slug, { title: "New offer", description: "" });
    await refresh();
  }

  async function handleDelete(offer: Offer) {
    await deleteOffer(business!.slug, offer.id);
    await refresh();
  }

  async function handleUpdate(offer: Offer, patch: Partial<Offer>) {
    await updateOffer(business!.slug, offer.id, patch);
    await refresh();
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">Discounts</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            {business.offers.length} offers
          </h1>
        </div>
        <Button variant="accent" onClick={handleAdd}>
          <Plus className="h-4 w-4" /> Add offer
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {business.offers.map((offer) => (
          <OfferRow key={offer.id} offer={offer} onUpdate={handleUpdate} onDelete={handleDelete} />
        ))}
        {business.offers.length === 0 && (
          <p className="text-sm text-ink-soft">No offers yet. Add one to show it on your storefront.</p>
        )}
      </div>
    </div>
  );
}

function OfferRow({
  offer,
  onUpdate,
  onDelete,
}: {
  offer: Offer;
  onUpdate: (o: Offer, patch: Partial<Offer>) => void;
  onDelete: (o: Offer) => void;
}) {
  const [title, setTitle] = useState(offer.title);
  const [description, setDescription] = useState(offer.description);

  return (
    <div className="rounded-lg border border-line p-4 flex items-start gap-3">
      <div className="flex-1 space-y-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title !== offer.title && onUpdate(offer, { title })}
          className="font-medium"
        />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => description !== offer.description && onUpdate(offer, { description })}
          placeholder="Description (optional)"
          className="text-sm"
        />
      </div>
      <button
        type="button"
        onClick={() => onDelete(offer)}
        className="rounded-sm p-1.5 text-ink-soft hover:bg-paper-dim hover:text-danger focus-ring mt-1"
        aria-label={`Delete ${offer.title}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
