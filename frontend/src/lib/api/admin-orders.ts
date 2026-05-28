import { apiRequest } from "@/lib/api/client";
import { getAuthHeaders } from "@/lib/auth-session";
import type {
  AdminOrderUpdatePayload,
  BackendOrderDto,
  OrderStatus,
} from "@/types";

export async function getAdminOrders(
  token: string,
): Promise<BackendOrderDto[]> {
  return apiRequest<BackendOrderDto[]>("/admin/orders/", {
    headers: getAuthHeaders(token),
  });
}

export async function updateAdminOrderStatus(
  token: string,
  orderId: number,
  status: OrderStatus,
): Promise<BackendOrderDto> {
  return apiRequest<BackendOrderDto>(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    query: {
      new_status: status,
    },
    headers: getAuthHeaders(token),
  });
}

export async function updateAdminOrder(
  token: string,
  orderId: number,
  payload: AdminOrderUpdatePayload,
): Promise<BackendOrderDto> {
  return apiRequest<BackendOrderDto>(`/admin/orders/${orderId}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}
