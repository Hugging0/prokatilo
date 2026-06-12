import { apiRequest } from "@/lib/api/client";
import { getAuthHeaders } from "@/lib/auth-session";
import type { PushSubscriptionPayload, WebPushPublicKeyDto } from "@/types";

export async function getWebPushPublicKey(): Promise<WebPushPublicKeyDto> {
  return apiRequest<WebPushPublicKeyDto>("/web-push/public-key");
}

export async function savePushSubscription(
  authToken: string,
  payload: PushSubscriptionPayload,
): Promise<void> {
  await apiRequest<void>("/me/push-subscriptions", {
    method: "POST",
    headers: getAuthHeaders(authToken),
    body: JSON.stringify(payload),
  });
}

export async function deletePushSubscription(
  authToken: string,
  endpoint: string,
): Promise<void> {
  await apiRequest<void>("/me/push-subscriptions", {
    method: "DELETE",
    headers: getAuthHeaders(authToken),
    body: JSON.stringify({ endpoint }),
  });
}
