import { apiRequest } from "@/lib/api/client";
import { getAuthHeaders } from "@/lib/auth-session";
import type {
  AdminServiceSettingsPayload,
  BackendServiceSettingsDto,
} from "@/types";

export async function getAdminServiceSettings(
  authToken: string,
): Promise<BackendServiceSettingsDto> {
  return apiRequest<BackendServiceSettingsDto>("/admin/settings/service", {
    headers: getAuthHeaders(authToken),
  });
}

export async function updateAdminServiceSettings(
  authToken: string,
  payload: AdminServiceSettingsPayload,
): Promise<BackendServiceSettingsDto> {
  return apiRequest<BackendServiceSettingsDto>("/admin/settings/service", {
    method: "PATCH",
    headers: getAuthHeaders(authToken),
    body: JSON.stringify(payload),
  });
}
