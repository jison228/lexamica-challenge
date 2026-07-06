/** A firm, as embedded in the current user. Mirrors the API's public firm. */
export interface Firm {
  id: string;
  name: string;
  slug: string;
}

/**
 * The current user, as returned by GET /me. Mirrors the API's public user
 * projection by hand (no codegen) — the API guarantees `passwordHash` and other
 * protected fields never appear here. The user's firm is embedded.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  firm: Firm;
}
