import { apiRequest } from "@/lib/api/client";
import { getAuthHeaders } from "@/lib/auth-session";
import type {
  BackendOrderDto,
  CreateOrderPayload,
  PaymentResponseDto,
} from "@/types";

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

export async function createOrderPayment(
  token: string,
  orderId: number,
): Promise<PaymentResponseDto> {
  return apiRequest<PaymentResponseDto>(`/orders/${orderId}/payment`, {
    method: "POST",
    headers: getAuthHeaders(token),
  });
}
