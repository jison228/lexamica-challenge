import { cookies } from 'next/headers';
import { serverApiUrl } from './config';

/**
 * Server-side fetch used by server components / SSR. It forwards the incoming
 * request's cookies to the API so the session travels with server-rendered
 * requests. `no-store` keeps auth-sensitive data from being cached.
 */
export async function serverFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const cookieStore = await cookies();
  return fetch(`${serverApiUrl}${path}`, {
    ...init,
    headers: { cookie: cookieStore.toString(), ...init?.headers },
    cache: 'no-store',
  });
}
