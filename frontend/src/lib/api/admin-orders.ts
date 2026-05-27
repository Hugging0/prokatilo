import { apiRequest } from "@/lib/api/client";
import type {
  AdminOrderUpdatePayload,
  BackendOrderDto,
  OrderStatus,
} from "@/types";

function getAdminHeaders(token: string): HeadersInit {
  return {
    "X-Admin-Token": token,
  };
}

export async function getAdminOrders(
  token: string,
): Promise<BackendOrderDto[]> {
  return apiRequest<BackendOrderDto[]>("/admin/orders/", {
    headers: getAdminHeaders(token),
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
    headers: getAdminHeaders(token),
  });
}

export async function updateAdminOrder(
  token: string,
  orderId: number,
  payload: AdminOrderUpdatePayload,
): Promise<BackendOrderDto> {
  return apiRequest<BackendOrderDto>(`/admin/orders/${orderId}`, {
    method: "PATCH",
    headers: getAdminHeaders(token),
    body: JSON.stringify(payload),
  });
}
