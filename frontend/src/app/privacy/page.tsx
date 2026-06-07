import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/LegalPage";
import { APP_NAME } from "@/lib/brand";
import { readLegalText } from "@/lib/server/legal";

const title = "Политика обработки персональных данных";

export const metadata: Metadata = {
  title,
  description:
    "Политика обработки и защиты персональных данных пользователей сервиса ПРОКАТило.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title={title}
      description={`Как ${APP_NAME} обрабатывает и защищает персональные данные пользователей.`}
      text={readLegalText("personal_data_policy.txt")}
    />
  );
}
