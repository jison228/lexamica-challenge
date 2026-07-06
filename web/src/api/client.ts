import { browserApiUrl } from './config';

/** Thrown for any non-2xx response so React Query can surface it uniformly.
 * `code` is the machine-readable conflict reason (e.g. INVITATION_EXPIRED,
 * ALREADY_MATCHED) the API returns, so the UI can tell the exact truth. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${browserApiUrl}${path}`, {
    ...init,
    // Send/receive the httpOnly session cookie on every request.
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!res.ok) {
    let message = res.statusText;
    let code: string | undefined;
    try {
      const body = (await res.json()) as { message?: string; code?: string };
      if (body?.message) message = body.message;
      code = body?.code;
    } catch {
      // response had no JSON body; keep statusText
    }
    throw new ApiError(res.status, message, code);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Browser-side API client. Server components use `serverFetch` instead. */
export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
};
