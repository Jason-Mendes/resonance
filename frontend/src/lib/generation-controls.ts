/**
 * Picks the editor's generation controls off a request body so the proxies can
 * forward them.
 *
 * Deliberately no validation. The backend owns the rules for what a tone or an
 * avoid term may be, and a second copy here would be a second thing to keep in
 * step. This only decides which keys travel, so an unrelated field a caller
 * invents never reaches a paid model call.
 */

export interface ForwardedControls {
  tone?: unknown;
  avoid?: unknown;
}

export function pickControls(body: unknown): ForwardedControls {
  const { tone, avoid } = (body ?? {}) as ForwardedControls;

  return {
    ...(tone !== undefined ? { tone } : {}),
    ...(avoid !== undefined ? { avoid } : {}),
  };
}
