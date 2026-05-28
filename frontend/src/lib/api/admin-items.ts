import { apiRequest } from "@/lib/api/client";
import { getAuthHeaders } from "@/lib/auth-session";
import type { AdminItemFormPayload, BackendItemDto } from "@/types";

export async function getAdminItems(
  token: string,
): Promise<BackendItemDto[]> {
  return apiRequest<BackendItemDto[]>("/admin/items/", {
    headers: getAuthHeaders(token),
  });
}

export async function createAdminItem(
  token: string,
  payload: AdminItemFormPayload,
): Promise<BackendItemDto> {
  return apiRequest<BackendItemDto>("/admin/items/", {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateAdminItem(
  token: string,
  itemId: number,
  payload: Partial<AdminItemFormPayload>,
): Promise<BackendItemDto> {
  return apiRequest<BackendItemDto>(`/admin/items/${itemId}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function setAdminItemAvailability(
  token: string,
  itemId: number,
  isAvailable: boolean,
): Promise<BackendItemDto> {
  return apiRequest<BackendItemDto>(
    `/admin/items/${itemId}/availability`,
    {
      method: "PATCH",
      query: {
        is_available: isAvailable,
      },
      headers: getAuthHeaders(token),
    },
  );
}

export async function archiveAdminItem(
  token: string,
  itemId: number,
): Promise<BackendItemDto> {
  return apiRequest<BackendItemDto>(`/admin/items/${itemId}/archive`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
  });
}

export async function deleteAdminItem(
  token: string,
  itemId: number,
): Promise<void> {
  await apiRequest<void>(`/admin/items/${itemId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
}
