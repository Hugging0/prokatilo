import { apiRequest } from "@/lib/api/client";
import type { BackendItemDto } from "@/types";

export async function getAvailableItems(): Promise<BackendItemDto[]> {
  return apiRequest<BackendItemDto[]>("/items/available/");
}

export async function getItems(): Promise<BackendItemDto[]> {
  return apiRequest<BackendItemDto[]>("/items/");
}
