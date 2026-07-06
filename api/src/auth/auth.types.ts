/** Claims we put inside the signed JWT. Keep this minimal — it's a pointer to
 * the user, not a snapshot of them. The user is re-loaded on every request. */
export interface JwtPayload {
  sub: string; // user id
  email: string;
}

/** What `req.user` looks like after the JWT strategy validates a request —
 * identical to the public user projection (includes the embedded firm). */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  firm: { id: string; name: string; slug: string };
}
