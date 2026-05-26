const DEFAULT_API_URL = "http://localhost:8000";

const configuredApiUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export const API_BASE_URL =
  configuredApiUrl && configuredApiUrl.length > 0
    ? configuredApiUrl
    : DEFAULT_API_URL;
