import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/LegalPage";
import {
  BUSINESS_ADDRESS,
  BUSINESS_EMAIL,
  BUSINESS_LEGAL_NAME,
  BUSINESS_LEGAL_STATUS,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_TAX_ID,
  BUSINESS_TELEGRAM_URL,
} from "@/lib/business";

const title = "Контакты";

const contactsText = `# Контакты сервиса «ПРОКАТило»

Дата публикации: 27.06.2026

Оператор сервиса: ${BUSINESS_LEGAL_NAME} (${BUSINESS_LEGAL_STATUS})
ИНН: ${BUSINESS_TAX_ID}
Адрес: ${BUSINESS_ADDRESS}
Телефон: ${BUSINESS_PHONE_DISPLAY}
Email поддержки: ${BUSINESS_EMAIL}
Email по персональным данным: ${BUSINESS_EMAIL}
Telegram: ${BUSINESS_TELEGRAM_URL}
Сайт: https://myprokatilo.ru

## Обращения пользователей

По вопросам бронирования, доставки, оплаты, возврата вещей и работы аккаунта можно написать на email поддержки.

По вопросам обработки персональных данных, отзыва согласия или удаления данных можно направить обращение на тот же email с указанием имени, телефона или email, использованных в сервисе.

## Статус сервиса

Сервис работает в коммерческом режиме и постепенно дорабатывается. Условия доставки, доступность вещей и точное время передачи могут уточняться оператором при подтверждении брони.`;

export const metadata: Metadata = {
  title,
  description:
    "Контакты сервиса ПРОКАТило для поддержки пользователей и вопросов по персональным данным.",
  alternates: {
    canonical: "/contacts",
  },
};

export default function ContactsPage() {
  return (
    <LegalPage
      title={title}
      description="Куда обращаться по вопросам бронирования, доставки и персональных данных."
      text={contactsText}
    />
  );
}
