/**
 * API base URLs. We keep two on purpose:
 * - `browserApiUrl` is what client-side code hits (must be reachable from the
 *   user's browser, hence NEXT_PUBLIC_*).
 * - `serverApiUrl` is what server components / SSR hit (can be an internal
 *   address in a real deploy). Falls back to the public one in local dev.
 */
export const browserApiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const serverApiUrl =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
