import { apiRequest } from "@/lib/api/client";
import type { BackendBookingDto, BackendItemDto } from "@/types";

export async function getAvailableItems(): Promise<BackendItemDto[]> {
  return apiRequest<BackendItemDto[]>("/items/available/");
}

export async function getItems(): Promise<BackendItemDto[]> {
  return apiRequest<BackendItemDto[]>("/items/");
}

export async function getItemBookings(
  itemId: number,
  rentalDate?: string,
): Promise<BackendBookingDto[]> {
  return apiRequest<BackendBookingDto[]>(`/items/${itemId}/bookings`, {
    query: {
      rental_date: rentalDate,
    },
  });
}
