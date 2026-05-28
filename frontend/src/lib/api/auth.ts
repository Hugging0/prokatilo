import { apiRequest } from "@/lib/api/client";
import type {
  AuthLoginPayload,
  AuthRegisterPayload,
  AuthResponseDto,
  BackendUserDto,
} from "@/types";

export async function registerUser(
  payload: AuthRegisterPayload,
): Promise<AuthResponseDto> {
  return apiRequest<AuthResponseDto>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(
  payload: AuthLoginPayload,
): Promise<AuthResponseDto> {
  return apiRequest<AuthResponseDto>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser(
  token: string,
): Promise<BackendUserDto> {
  return apiRequest<BackendUserDto>("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
