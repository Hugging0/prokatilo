import { API_BASE_URL } from "@/lib/env";

interface ApiRequestOptions extends RequestInit {
  query?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(
  path: string,
  query?: ApiRequestOptions["query"],
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedBase = API_BASE_URL.replace(/\/$/, "");
  const url = normalizedBase.startsWith("/")
    ? new URL(
        `${normalizedBase}${normalizedPath}`.replace(/\/{2,}/g, "/"),
        window.location.origin,
      )
    : new URL(`${normalizedBase}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { query, headers, ...requestOptions } = options;
  const url = buildUrl(path, query);

  let response: Response;

  try {
    response = await fetch(url, {
      cache: "no-store",
      ...requestOptions,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });
  } catch {
    throw new Error(
      "Не удалось связаться с сервером. Проверьте, что backend запущен.",
    );
  }

  if (!response.ok) {
    let detail = `API request failed: ${response.status}`;

    try {
      const errorBody = (await response.json()) as {
        detail?: string;
      };
      detail = errorBody.detail || detail;
    } catch {
      // Ignore parsing errors and keep a generic message.
    }

    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
