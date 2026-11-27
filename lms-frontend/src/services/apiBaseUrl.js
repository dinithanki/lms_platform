const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = (
  configuredBaseUrl ?? (import.meta.env.PROD ? "" : "http://localhost:8080")
).replace(/\/+$/, "");
