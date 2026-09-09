/**
 * Server-side client for the Express backend. Only route handlers import this;
 * the browser talks to this app's own origin and never to the backend directly,
 * so no cross-origin request is ever made and CORS never applies.
 */

// Deliberately not NEXT_PUBLIC_: those are inlined into the browser bundle at
// build time, so the value would be frozen into the image before the backend's
// deployed URL is known. Read server-side, it can be set on a running service.
const getBackendUrl = (): string => {
  const url = process.env.BACKEND_URL;
  if (!url) {
    throw new Error(
      "BACKEND_URL is not set. Add it to frontend/.env.local or the deployment environment.",
    );
  }
  return url.replace(/\/+$/, "");
};

/** Carries the backend's status code so a route handler can pass it through. */
export class BackendError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "BackendError";
  }
}

/** POSTs JSON to the backend and returns its parsed response. */
export async function postToBackend<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${getBackendUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail: unknown = await response.json().catch(() => null);
    const message =
      typeof (detail as { error?: unknown })?.error === "string"
        ? (detail as { error: string }).error
        : `Backend responded ${response.status}`;
    throw new BackendError(response.status, message);
  }

  return response.json() as Promise<T>;
}

/** GETs JSON from the backend, for polling a job's status. */
export async function getFromBackend<T>(path: string): Promise<T> {
  const response = await fetch(`${getBackendUrl()}${path}`, { cache: "no-store" });

  if (!response.ok) {
    throw new BackendError(response.status, `Backend responded ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Fetches a binary body and hands back the raw response, so a route handler can
 * stream it on without buffering an entire audio file into memory.
 */
export async function streamFromBackend(path: string): Promise<Response> {
  const response = await fetch(`${getBackendUrl()}${path}`, { cache: "no-store" });

  if (!response.ok) {
    throw new BackendError(response.status, `Backend responded ${response.status}`);
  }

  return response;
}
