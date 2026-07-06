'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { isUnderReview } from '@/domain/dispute/logic';
import type { InvitationDetail } from '@/domain/invitation/types';
import { SimActions } from './SimActions';
import { DisputeStatements } from '@/components/disputes/DisputeStatements';
import { ExpiresAt } from '@/components/invitations/shared/ExpiresAt';

/**
 * The detail header card: what it is, its demo affordance, and what you can do
 * (accept/decline while live, or the dispute statements while under review).
 * Purely presentational — the accept/decline mutations live in the parent so
 * they survive the re-render an accept triggers.
 */
export function DetailHeader({
  detail,
  live,
  onAccept,
  onDecline,
  accepting,
  declining,
}: {
  detail: InvitationDetail;
  live: boolean;
  onAccept: () => void;
  onDecline: () => void;
  accepting: boolean;
  declining: boolean;
}) {
  const busy = accepting || declining;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {detail.publicSummary.caseType}
            </h1>
            <SimActions detail={detail} />
          </div>
          <p className="text-muted-foreground">{detail.publicSummary.state}</p>
        </div>

        {live && (
          <div className="flex shrink-0 flex-col items-start gap-2.5 sm:items-end">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onDecline} loading={declining} disabled={busy}>
                Decline
              </Button>
              <Button onClick={onAccept} loading={accepting} disabled={busy}>
                Accept Referral
              </Button>
            </div>
            <ExpiresAt date={detail.expiresAt} icon className="text-xs text-muted-foreground" />
          </div>
        )}

        {isUnderReview(detail) && (
          <div className="shrink-0">
            <DisputeStatements detail={detail} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
