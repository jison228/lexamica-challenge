import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { isInvitationLive } from '@/domain/invitation/logic';
import { canReportSigning } from '@/domain/dispute/logic';
import type { InvitationSummary } from '@/domain/invitation/types';
import { StatusBadge } from '@/components/invitations/shared/StatusBadge';
import { ExpiresAt } from '@/components/invitations/shared/ExpiresAt';

export function InvitationRow({ item }: { item: InvitationSummary }) {
  const { publicSummary: s } = item;
  return (
    <li>
      <Link
        href={`/invitations/${item.invitationId}`}
        className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-foreground/25"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{s.caseType}</p>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {s.state}
            {s.estimatedValueRange ? ` · ${s.estimatedValueRange}` : ''}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{rowMeta(item)}</p>
        </div>
        <StatusBadge invitation={item} />
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  );
}

/** The row's third line: a live countdown, a claim hint, or a spacer. */
function rowMeta(item: InvitationSummary): ReactNode {
  if (isInvitationLive(item)) return <ExpiresAt date={item.expiresAt} />;
  if (canReportSigning(item)) return 'Closed — you can still report an off-platform signing';
  return ' ';
}
