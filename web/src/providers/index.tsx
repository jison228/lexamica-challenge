'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * Cross-cutting client providers, mounted once at the root layout. This is a
 * provider *composition* — it wires library providers (React Query today) and
 * is where any app-level context (theme, current user) would slot in later.
 */
export function Providers({ children }: { children: ReactNode }) {
  // One client per browser session; created lazily so it isn't shared across
  // requests on the server.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
