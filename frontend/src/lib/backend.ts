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

// Cloud Run exposes an identity token for the service's own account here. It
// is unreachable anywhere else, which is how this tells the two apart.
const METADATA_TOKEN_URL =
  "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity";

// Tokens last an hour. Re-used until close to expiry so a burst of requests
// does not mean a metadata round trip each.
const TOKEN_TTL_MS = 50 * 60 * 1000;
const METADATA_TIMEOUT_MS = 1_000;

let cachedToken: { value: string; expiresAt: number } | undefined;

/**
 * An identity token for calling the backend, or null when there is no metadata
 * server. Null means local development, where the backend is a plain process
 * with no authentication in front of it.
 */
async function getIdentityToken(audience: string): Promise<string | null> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value;

  try {
    const response = await fetch(`${METADATA_TOKEN_URL}?audience=${encodeURIComponent(audience)}`, {
      headers: { "Metadata-Flavor": "Google" },
      signal: AbortSignal.timeout(METADATA_TIMEOUT_MS),
    });
    if (!response.ok) return null;

    const value = (await response.text()).trim();
    cachedToken = { value, expiresAt: Date.now() + TOKEN_TTL_MS };
    return value;
  } catch {
    // No metadata server, so this is not Cloud Run and no token is needed.
    return null;
  }
}

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

/** Adds the identity token when there is one, which is only on Cloud Run. */
async function authHeaders(base: Record<string, string> = {}): Promise<Record<string, string>> {
  const token = await getIdentityToken(getBackendUrl());
  return token ? { ...base, Authorization: `Bearer ${token}` } : base;
}

/** POSTs JSON to the backend and returns its parsed response. */
export async function postToBackend<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${getBackendUrl()}${path}`, {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
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
  const response = await fetch(`${getBackendUrl()}${path}`, {
    cache: "no-store",
    headers: await authHeaders(),
  });

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
  const response = await fetch(`${getBackendUrl()}${path}`, {
    cache: "no-store",
    headers: await authHeaders(),
  });

  if (!response.ok) {
    throw new BackendError(response.status, `Backend responded ${response.status}`);
  }

  return response;
}
