import { apiTimeout } from "@/utils/config";

export interface FetchOptions {
  timeout?: number;
  retries?: number;
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit & FetchOptions = {},
): Promise<Response> {
  const { timeout = apiTimeout, retries = 3, ...fetchOptions } = options;

  let lastError: Error;

  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Fetch attempt ${i + 1} failed:`, error);

      if (i < retries - 1) {
        // Wait before retry with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  throw lastError!;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>\"'&]/g, "");
}

export function createCacheKey(game: string, params: Record<string, string>): string {
  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join(":");
  return `${game}:${sortedParams}`;
}
