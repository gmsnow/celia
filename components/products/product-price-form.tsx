"use client";

import { useMemo, useState } from "react";
import { Banknote, CheckCircle2, Package, Tag, X, XCircle } from "lucide-react";
import { createProductSchema } from "@/lib/products/product";
import { useLocale } from "@/lib/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

interface FieldErrors {
  name?: string;
  category?: string;
  price?: string;
}

const headerGradient = `linear-gradient(135deg, color-mix(in srgb, var(--primary) 60%, white), var(--primary) 50%, color-mix(in srgb, var(--primary) 75%, black))`;

export function ProductPriceForm({ onSuccess }: { onSuccess?: () => void }) {
  const { locale, t } = useLocale();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const schema = useMemo(() => createProductSchema(t), [t]);

  function reset() {
    setName("");
    setCategory("");
    setPrice("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const result = schema.safeParse({ name, category, price });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        category: fieldErrors.category?.[0],
        price: fieldErrors.price?.[0],
      });
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": locale,
        },
        body: JSON.stringify(result.data),
      });
      const data = (await res.json()) as { message?: string; error?: string };

      if (res.ok) {
        setMessage({ type: "success", text: data.message ?? t.addProductPrice.successMessage });
        reset();
        onSuccess?.();
      } else {
        setMessage({ type: "error", text: data.error ?? t.addProductPrice.invalidData });
      }
    } catch {
      setMessage({ type: "error", text: t.addProductPrice.serverError });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div
        className="flex items-center gap-3 px-5 py-5 text-white sm:px-6"
        style={{ backgroundImage: headerGradient }}
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-inner">
          <Package className="size-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-extrabold">{t.addProductPrice.title}</h2>
          <p className="text-xs font-medium text-white/80">{t.addProductPrice.subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col space-y-5 p-5 sm:p-6">
        {message && (
          <div
            role="alert"
            className={cn(
              "flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium",
              message.type === "success"
                ? "border-success/30 bg-success/10 text-success"
                : "border-destructive/30 bg-destructive/10 text-destructive",
            )}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <FormField label={t.addProductPrice.nameLabel} htmlFor="name" error={errors.name}>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder={t.addProductPrice.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            startIcon={<Tag className="size-4" aria-hidden="true" />}
            hasError={!!errors.name}
            disabled={loading}
          />
        </FormField>

        <FormField label={t.addProductPrice.categoryLabel} htmlFor="category" error={errors.category}>
          <Input
            id="category"
            name="category"
            type="text"
            placeholder={t.addProductPrice.categoryPlaceholder}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            startIcon={<Package className="size-4" aria-hidden="true" />}
            hasError={!!errors.category}
            disabled={loading}
          />
        </FormField>

        <FormField label={t.addProductPrice.priceLabel} htmlFor="price" error={errors.price}>
          <Input
            id="price"
            name="price"
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            placeholder={t.addProductPrice.pricePlaceholder}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            startIcon={<Banknote className="size-4" aria-hidden="true" />}
            hasError={!!errors.price}
            disabled={loading}
          />
        </FormField>

        <div className="mt-auto flex items-center justify-end gap-3 border-t border-border pt-5">
          <Button type="button" variant="outline" size="lg" onClick={reset} disabled={loading}>
            <X className="size-4" aria-hidden="true" />
            {t.addProductPrice.cancel}
          </Button>
          <Button type="submit" variant="success" size="lg" className="w-full sm:w-auto" loading={loading}>
            {loading ? t.addProductPrice.saving : t.addProductPrice.save}
          </Button>
        </div>
      </form>
    </div>
  );
}
