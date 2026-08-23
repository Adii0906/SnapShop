"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { DashboardState } from "@/components/dashboard/DashboardState";
import { createProduct, deleteProduct, updateProduct } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";

export default function ProductsPage() {
  const { business, loading, error, refresh } = useDashboard();
  const [savingId, setSavingId] = useState<string | null>(null);

  if (loading || error || !business) return <DashboardState loading={loading} error={error} />;

  async function commit(product: Product, patch: { name?: string; price?: number; category_name?: string; stock?: number; is_published?: boolean; image_url?: string | null }) {
    setSavingId(product.id);
    try {
      await updateProduct(business!.slug, product.id, {
        name: patch.name,
        price: patch.price,
        category: patch.category_name,
        stock: patch.stock,
        is_published: patch.is_published,
        image_url: patch.image_url,
      });
      await refresh();
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(product: Product) {
    await deleteProduct(business!.slug, product.id);
    await refresh();
  }

  async function handleAdd() {
    await createProduct(business!.slug, {
      name: "New product",
      price: 0,
      category: business!.categories[0]?.name || "Uncategorized",
      stock: 0,
      image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    });
    await refresh();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">Products</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            {business.products.length} products
          </h1>
        </div>
        <Button variant="accent" onClick={handleAdd}>
          <Plus className="h-4 w-4" /> Add product
        </Button>
      </div>

      <div className="mt-6 rounded-lg border border-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-paper-dim/50 text-left text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium w-32">Price</th>
                <th className="px-4 py-3 font-medium w-40">Category</th>
                <th className="px-4 py-3 font-medium w-24">Stock</th>
                <th className="px-4 py-3 font-medium w-28">Status</th>
                <th className="px-4 py-3 font-medium w-40">Image</th>
                <th className="px-4 py-3 font-medium w-10" />
              </tr>
            </thead>
            <tbody>
              {business.products.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  onCommit={commit}
                  onDelete={handleDelete}
                  saving={savingId === p.id}
                />
              ))}
              {business.products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink-soft">
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProductRow({
  product,
  onCommit,
  onDelete,
  saving,
}: {
  product: Product;
  onCommit: (p: Product, patch: { name?: string; price?: number; category_name?: string; stock?: number; is_published?: boolean; image_url?: string | null }) => void;
  onDelete: (p: Product) => void;
  saving: boolean;
}) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [category, setCategory] = useState(product.category_name || "");
  const [stock, setStock] = useState(product.stock);
  const [imageUrl, setImageUrl] = useState(product.image_url || "");

  return (
    <tr className="border-b border-line last:border-0" style={{ opacity: saving ? 0.6 : 1 }}>
      <td className="px-4 py-2">
        <div className="flex items-center gap-3">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-10 w-10 rounded-md object-cover border border-line" />
          ) : (
            <div className="h-10 w-10 rounded-md border border-line bg-paper-dim/50 flex items-center justify-center text-[10px] font-mono text-ink-soft">
              IMG
            </div>
          )}
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name !== product.name && onCommit(product, { name })}
            className="border-transparent bg-transparent px-2 focus-visible:border-line"
          />
        </div>
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-1 font-mono">
          <span className="text-ink-soft">Rs.</span>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            onBlur={() => price !== product.price && onCommit(product, { price })}
            className="border-transparent bg-transparent px-1 font-mono focus-visible:border-line"
          />
        </div>
      </td>
      <td className="px-4 py-2">
        <Input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          onBlur={() => category !== product.category_name && onCommit(product, { category_name: category })}
          className="border-transparent bg-transparent px-2 focus-visible:border-line"
        />
      </td>
      <td className="px-4 py-2">
        <Input
          type="number"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          onBlur={() => stock !== product.stock && onCommit(product, { stock })}
          className="border-transparent bg-transparent px-2 font-mono focus-visible:border-line"
        />
      </td>
      <td className="px-4 py-2">
        <button type="button" onClick={() => onCommit(product, { is_published: !product.is_published })}>
          <Badge variant={product.is_published ? "success" : "neutral"}>
            {product.is_published ? "Published" : "Hidden"}
          </Badge>
        </button>
      </td>
      <td className="px-4 py-2">
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          onBlur={() => imageUrl !== (product.image_url || "") && onCommit(product, { image_url: imageUrl || null })}
          placeholder="Image URL"
          className="border-transparent bg-transparent px-2 focus-visible:border-line"
        />
      </td>
      <td className="px-4 py-2 text-right">
        <button
          type="button"
          onClick={() => onDelete(product)}
          className="rounded-sm p-1.5 text-ink-soft hover:bg-paper-dim hover:text-danger focus-ring"
          aria-label={`Delete ${product.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}
