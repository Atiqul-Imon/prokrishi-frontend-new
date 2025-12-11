const DEFAULT_API_BASE_URL = "http://localhost:3501/api";

export const getApiBaseUrl = (): string => {
  const envValue = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (envValue && envValue.length > 0) {
    return envValue.replace(/\/$/, "");
  }
  return DEFAULT_API_BASE_URL;
};

