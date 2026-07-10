import { apiRequest } from "@/lib/api/client";
import type { PublicServiceSettingsDto } from "@/types";

export async function getPublicServiceSettings(): Promise<PublicServiceSettingsDto> {
  return apiRequest<PublicServiceSettingsDto>("/settings/service");
}
