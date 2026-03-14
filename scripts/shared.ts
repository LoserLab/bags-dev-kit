/**
 * Shared utilities for all bags-dev-kit scripts.
 * Centralizes config loading, API base URL, and fetch helpers.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export const API_BASE = "https://public-api-v2.bags.fm/api/v1";
export const CONFIG_PATH = join(homedir(), ".bags-dev-kit", "config.json");
export const WSOL = "So11111111111111111111111111111111111111112";

export interface BagsConfig {
  apiKey: string;
  defaultWallet?: string;
  configuredAt?: string;
}

export function loadConfig(): BagsConfig {
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    console.error("Config not found. Run /bags-dev-kit:setup first.");
    process.exit(1);
  }
}

/**
 * Fetch from the Bags API with consistent error handling.
 * Returns the response data or null on failure (with logged error).
 */
export async function apiFetch<T = unknown>(
  path: string,
  apiKey: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { "x-api-key": apiKey, ...options?.headers },
    });
    if (!res.ok) {
      console.error(`API error (${res.status}) for ${path.split("?")[0]}`);
      return null;
    }
    const data = await res.json();
    if (!data.success) {
      console.error(`API returned error for ${path.split("?")[0]}: ${data.error || "unknown"}`);
      return null;
    }
    return data.response as T;
  } catch (err) {
    console.error(`Fetch failed for ${path.split("?")[0]}: ${err instanceof Error ? err.message : "unknown"}`);
    return null;
  }
}

/**
 * Fetch from the Bags API, exiting on failure (for scripts that cannot continue without data).
 */
export async function apiFetchOrExit<T = unknown>(
  path: string,
  apiKey: string,
  options?: RequestInit
): Promise<T> {
  const result = await apiFetch<T>(path, apiKey, options);
  if (result === null) {
    process.exit(1);
  }
  return result;
}
