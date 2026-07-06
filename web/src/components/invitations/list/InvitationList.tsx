'use client';

import { useInbox } from '@/domain/invitation/hooks';
import { isHeldCase, isPendingInvitation } from '@/domain/invitation/logic';
import type { InvitationSummary } from '@/domain/invitation/types';
import { InvitationRow } from './InvitationRow';

/**
 * The firm's list of referrals, live via React Query (seeded from SSR). One
 * component serves both Invitations and Cases — the caller passes the variant.
 */
export function InvitationList({
  initialData,
  variant,
  emptyMessage,
}: {
  initialData: InvitationSummary[];
  variant: 'invitations' | 'cases';
  emptyMessage: string;
}) {
  const { data = initialData } = useInbox(initialData);
  const items = data.filter(variant === 'cases' ? isHeldCase : isPendingInvitation);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <InvitationRow key={item.invitationId} item={item} />
      ))}
    </ul>
  );
}
