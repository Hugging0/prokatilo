import { apiRequest } from "@/lib/api/client";
import { getAuthHeaders } from "@/lib/auth-session";
import type { BackendOrderDto, CreateOrderPayload } from "@/types";

export async function createOrder(
  token: string,
  payload: CreateOrderPayload,
): Promise<BackendOrderDto> {
  return apiRequest<BackendOrderDto>("/orders/", {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function getMyOrders(token: string): Promise<BackendOrderDto[]> {
  return apiRequest<BackendOrderDto[]>("/me/orders", {
    headers: getAuthHeaders(token),
  });
}
