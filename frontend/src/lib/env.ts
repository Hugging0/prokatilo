const DEFAULT_API_URL = "/api";

const configuredApiUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export const API_BASE_URL =
  configuredApiUrl && configuredApiUrl.length > 0
    ? configuredApiUrl
    : DEFAULT_API_URL;
