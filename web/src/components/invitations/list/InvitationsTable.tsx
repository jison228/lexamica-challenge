import Link from 'next/link';
import type { ReactNode } from 'react';
import type { InvitationSummary } from '@/domain/invitation/types';

/**
 * A compact table of referrals with a header row and divided, hover-highlighted
 * rows. The caller renders the right-hand column (expiry, status, …).
 */
export function InvitationsTable({
  items,
  columnLabel,
  renderTrailing,
}: {
  items: InvitationSummary[];
  columnLabel: string;
  renderTrailing: (item: InvitationSummary) => ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between gap-4 border-b border-border bg-secondary/60 px-4 py-2.5 text-xs font-medium text-muted-foreground">
        <span>Case</span>
        <span>{columnLabel}</span>
      </div>
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.invitationId}>
            <Link
              href={`/invitations/${item.invitationId}`}
              className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-secondary"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.publicSummary.caseType}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.publicSummary.state}
                </p>
              </div>
              <div className="shrink-0 text-sm text-muted-foreground">
                {renderTrailing(item)}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
