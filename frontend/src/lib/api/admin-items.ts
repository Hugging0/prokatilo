import { apiRequest } from "@/lib/api/client";
import type { AdminItemFormPayload, BackendItemDto } from "@/types";

function getAdminHeaders(token: string): HeadersInit {
  return {
    "X-Admin-Token": token,
  };
}

export async function getAdminItems(
  token: string,
): Promise<BackendItemDto[]> {
  return apiRequest<BackendItemDto[]>("/admin/items/", {
    headers: getAdminHeaders(token),
  });
}

export async function createAdminItem(
  token: string,
  payload: AdminItemFormPayload,
): Promise<BackendItemDto> {
  return apiRequest<BackendItemDto>("/admin/items/", {
    method: "POST",
    headers: getAdminHeaders(token),
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
    headers: getAdminHeaders(token),
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
      headers: getAdminHeaders(token),
    },
  );
}

export async function archiveAdminItem(
  token: string,
  itemId: number,
): Promise<BackendItemDto> {
  return apiRequest<BackendItemDto>(`/admin/items/${itemId}/archive`, {
    method: "PATCH",
    headers: getAdminHeaders(token),
  });
}

export async function deleteAdminItem(
  token: string,
  itemId: number,
): Promise<void> {
  await apiRequest<void>(`/admin/items/${itemId}`, {
    method: "DELETE",
    headers: getAdminHeaders(token),
  });
}
