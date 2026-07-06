import { Badge, type BadgeTone } from '@/components/ui/badge';
import { invitationUiState, type InvitationUiState } from '@/domain/invitation/logic';
import type { InvitationSummary } from '@/domain/invitation/types';

// The one place invitation state → user-facing label + tone. No hooks, so this
// renders fine on the server (used in SSR lists).
const PRESENTATION: Record<InvitationUiState, { label: string; tone: BadgeTone }> = {
  awaiting: { label: 'Awaiting your response', tone: 'warning' },
  held: { label: 'You represent this client', tone: 'success' },
  // A firm never learns another firm took the case (see the read-model masking);
  // 'taken' is unreachable for non-holders, and labelled "Closed" as a backstop.
  taken: { label: 'Closed', tone: 'muted' },
  under_review: { label: 'Under review', tone: 'info' },
  expired: { label: 'Expired', tone: 'muted' },
  declined: { label: 'Declined', tone: 'muted' },
  closed: { label: 'Closed', tone: 'muted' },
};

export function StatusBadge({ invitation }: { invitation: InvitationSummary }) {
  const { label, tone } = PRESENTATION[invitationUiState(invitation)];
  return <Badge tone={tone}>{label}</Badge>;
}
