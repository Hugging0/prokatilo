import { apiRequest } from "@/lib/api/client";
import { getAuthHeaders } from "@/lib/auth-session";
import type { AdminPromoCodePayload, BackendPromoCodeDto } from "@/types";

export async function getAdminPromoCodes(
  authToken: string,
): Promise<BackendPromoCodeDto[]> {
  return apiRequest<BackendPromoCodeDto[]>("/admin/promo-codes/", {
    headers: getAuthHeaders(authToken),
  });
}

export async function createAdminPromoCode(
  authToken: string,
  payload: AdminPromoCodePayload,
): Promise<BackendPromoCodeDto> {
  return apiRequest<BackendPromoCodeDto>("/admin/promo-codes/", {
    method: "POST",
    headers: getAuthHeaders(authToken),
    body: JSON.stringify(payload),
  });
}

export async function updateAdminPromoCode(
  authToken: string,
  promoCodeId: number,
  payload: Partial<AdminPromoCodePayload>,
): Promise<BackendPromoCodeDto> {
  return apiRequest<BackendPromoCodeDto>(`/admin/promo-codes/${promoCodeId}`, {
    method: "PATCH",
    headers: getAuthHeaders(authToken),
    body: JSON.stringify(payload),
  });
}

export async function archiveAdminPromoCode(
  authToken: string,
  promoCodeId: number,
): Promise<BackendPromoCodeDto> {
  return apiRequest<BackendPromoCodeDto>(
    `/admin/promo-codes/${promoCodeId}/archive`,
    {
      method: "PATCH",
      headers: getAuthHeaders(authToken),
    },
  );
}
