import { isRecord } from "./typeGuards";

export async function safeJsonResponse<T>(response: Response): Promise<T | null> {
  const raw = (await response.text()).trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function jsonErrorMessage(payload: unknown, fallback: string): string {
  if (isRecord(payload) && typeof payload.error === "string" && payload.error.trim()) {
    return payload.error.trim();
  }
  return fallback;
}
