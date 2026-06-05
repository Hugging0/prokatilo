import type { ReactNode } from "react";

import { AppCard } from "@/components/ui/AppCard";

export function CheckoutPanel({ children }: { children: ReactNode }) {
  return <AppCard>{children}</AppCard>;
}
