import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/LegalPage";
import { readLegalText } from "@/lib/server/legal";

const title = "Согласие на обработку персональных данных";

export const metadata: Metadata = {
  title,
  description:
    "Согласие пользователя на обработку персональных данных в сервисе ПРОКАТило.",
  alternates: {
    canonical: "/consent",
  },
};

export default function ConsentPage() {
  return (
    <LegalPage
      title={title}
      description="Текст согласия, которое пользователь даёт при регистрации, бронировании или обращении в поддержку."
      text={readLegalText("short_text_UI.txt")}
    />
  );
}
