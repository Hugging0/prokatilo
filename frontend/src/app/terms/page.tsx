import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/LegalPage";
import { readLegalText } from "@/lib/server/legal";

const title = "Пользовательское соглашение";

export const metadata: Metadata = {
  title,
  description:
    "Условия использования сервиса ПРОКАТило, бронирования, доставки, оплаты и возврата вещей.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <LegalPage
      title={title}
      description="Правила использования сервиса, оформления брони, оплаты и возврата вещей."
      text={readLegalText("user_agreement.txt")}
    />
  );
}
