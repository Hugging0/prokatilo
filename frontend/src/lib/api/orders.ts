import { apiRequest } from "@/lib/api/client";
import type { BackendOrderDto, CreateOrderPayload } from "@/types";

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<BackendOrderDto> {
  return apiRequest<BackendOrderDto>("/orders/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMyOrders(
  customerPhone: string,
): Promise<BackendOrderDto[]> {
  return apiRequest<BackendOrderDto[]>("/orders/my", {
    query: {
      customer_phone: customerPhone,
    },
  });
}
