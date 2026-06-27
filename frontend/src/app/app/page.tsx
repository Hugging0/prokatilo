import { AppShell } from "@/components/features/app/AppShell";

interface AppPageProps {
  searchParams: Promise<{
    item?: string | string[];
  }>;
}

export default async function AppPage({ searchParams }: AppPageProps) {
  const params = await searchParams;
  const rawItemId = Array.isArray(params.item) ? params.item[0] : params.item;
  const parsedItemId = Number(rawItemId);
  const initialItemId = Number.isInteger(parsedItemId) && parsedItemId > 0
    ? parsedItemId
    : null;

  return <AppShell initialItemId={initialItemId} />;
}
