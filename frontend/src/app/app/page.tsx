import { AppShell } from "@/components/features/app/AppShell";
import { isSeoProductSlug } from "@/lib/catalog-product-links";

interface AppPageProps {
  searchParams: Promise<{
    item?: string | string[];
    product?: string | string[];
  }>;
}

export default async function AppPage({ searchParams }: AppPageProps) {
  const params = await searchParams;
  const rawItemId = Array.isArray(params.item) ? params.item[0] : params.item;
  const rawProductSlug = Array.isArray(params.product)
    ? params.product[0]
    : params.product;
  const parsedItemId = Number(rawItemId);
  const initialItemId = Number.isInteger(parsedItemId) && parsedItemId > 0
    ? parsedItemId
    : null;
  const initialProductSlug = rawProductSlug && isSeoProductSlug(rawProductSlug)
    ? rawProductSlug
    : null;

  return (
    <AppShell
      initialItemId={initialItemId}
      initialProductSlug={initialProductSlug}
    />
  );
}
