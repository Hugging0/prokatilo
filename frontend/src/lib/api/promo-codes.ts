import { apiRequest } from "@/lib/api/client";
import { getAuthHeaders } from "@/lib/auth-session";
import type {
  BackendPromoCodeActivateDto,
  BackendPromoCodePreviewDto,
} from "@/types";

export async function previewPromoCode(
  authToken: string,
  payload: {
    code: string;
    subtotal_price: number;
  },
): Promise<BackendPromoCodePreviewDto> {
  return apiRequest<BackendPromoCodePreviewDto>("/me/promo-codes/preview", {
    method: "POST",
    headers: getAuthHeaders(authToken),
    body: JSON.stringify(payload),
  });
}

export async function activatePromoCode(
  authToken: string,
  payload: {
    code: string;
  },
): Promise<BackendPromoCodeActivateDto> {
  return apiRequest<BackendPromoCodeActivateDto>("/me/promo-codes/activate", {
    method: "POST",
    headers: getAuthHeaders(authToken),
    body: JSON.stringify(payload),
  });
}
