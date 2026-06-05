import { AppNotice } from "@/components/ui/AppNotice";

export function InlineWarning({ text }: { text: string }) {
  return (
    <AppNotice tone="danger" className="px-4 py-3">
      {text}
    </AppNotice>
  );
}
