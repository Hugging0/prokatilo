import { apiRequest } from "@/lib/api/client";
import { getAuthHeaders } from "@/lib/auth-session";
import type {
  BackendLoyaltySummaryDto,
  BackendLoyaltyTransactionDto,
} from "@/types";

export async function getLoyaltySummary(
  authToken: string,
): Promise<BackendLoyaltySummaryDto> {
  return apiRequest<BackendLoyaltySummaryDto>("/me/loyalty", {
    headers: getAuthHeaders(authToken),
  });
}

export async function getLoyaltyTransactions(
  authToken: string,
  limit = 50,
): Promise<BackendLoyaltyTransactionDto[]> {
  return apiRequest<BackendLoyaltyTransactionDto[]>(
    "/me/loyalty/transactions",
    {
      headers: getAuthHeaders(authToken),
      query: { limit },
    },
  );
}
