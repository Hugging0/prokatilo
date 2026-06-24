import { apiRequest } from "@/lib/api/client";
import type { BackendDeliveryEstimateDto } from "@/types";

export async function getDeliveryEstimateByAddress(
  address: string,
): Promise<BackendDeliveryEstimateDto> {
  return apiRequest<BackendDeliveryEstimateDto>("/delivery/estimate", {
    query: { address },
  });
}
