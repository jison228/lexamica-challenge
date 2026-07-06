'use client';

import { useIsMutating } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

/**
 * A slim progress bar under the top bar. Shows while a user action
 * (a mutation) is in flight — deliberately NOT for background polling/refetches,
 * so the bar stays meaningful. It appears immediately and lingers briefly on
 * finish, so even a fast local request registers visibly.
 */
export function TopProgress() {
  const busy = useIsMutating() > 0;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (busy) {
      setShow(true);
      return;
    }
    const t = setTimeout(() => setShow(false), 400);
    return () => clearTimeout(t);
  }, [busy]);

  return (
    <div className="relative h-0.5 w-full overflow-hidden" aria-hidden>
      {show && (
        <div
          className="absolute inset-y-0 rounded-full bg-accent-foreground"
          style={{ animation: 'top-progress 1.1s ease-in-out infinite' }}
        />
      )}
    </div>
  );
}
