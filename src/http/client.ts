/* ===========================================================
   🌌 HUMAN PATTERN LAB — HTTP CLIENT (minimal)
   -----------------------------------------------------------
   Purpose: Fetch wrapper with consistent error shaping.
   Notes:
     - Supports both raw API payloads and envelope form { ok: true, data: ... }.
   =========================================================== */

import { getConfig } from "../config.js";

export class HttpError extends Error {
  status?: number;
  body?: string;

  constructor(message: string, status?: number, body?: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && (payload as any).ok === true) {
    return (payload as any).data as T;
  }
  return payload as T;
}

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const { apiBaseUrl } = getConfig();
  const url = apiBaseUrl + path;

  const res = await fetch(url, { method: "GET", signal });

  if (!res.ok) {
    let body = "";
    try { body = await res.text(); } catch { /* ignore */ }
    throw new HttpError(`GET ${path} failed`, res.status, body);
  }

  const payload = (await res.json()) as unknown;
  return unwrap<T>(payload);
}

export async function postJson<T>(
  path: string,
  body: unknown,
  token?: string,
  signal?: AbortSignal
): Promise<T> {
  const { apiBaseUrl } = getConfig();
  const url = apiBaseUrl + path;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    let responseBody = "";
    try { responseBody = await res.text(); } catch { /* ignore */ }
    throw new HttpError(`POST ${path} failed`, res.status, responseBody);
  }

  const payload = (await res.json()) as unknown;
  return unwrap<T>(payload);
}
