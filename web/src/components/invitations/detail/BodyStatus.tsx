'use client';

import { Notice } from '@/components/common/Notice';
import { canReportSigning, isUnderReview } from '@/domain/dispute/logic';
import { isInvitationLive } from '@/domain/invitation/logic';
import type { InvitationDetail } from '@/domain/invitation/types';
import { InvitationStatus } from '@/domain/invitation/types';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

/**
 * The state-dependent body content — the honest status of the referral: held,
 * contested, under review, or closed. The live accept/decline buttons live in
 * the header card; the report/claim banner lives at the bottom of the page.
 */
export function BodyStatus({ detail }: { detail: InvitationDetail }) {
  // I hold the case.
  if (detail.amAccepted) {
    if (isUnderReview(detail)) {
      return (
        <Notice
          tone="warning"
          icon={AlertTriangle}
          title="A conflict was raised on this case"
          body="Another firm reported signing this client. Your acceptance stands but is provisional while Lexamica reviews the potential duplicate representation."
        />
      );
    }
    return (
      <Notice
        tone="success"
        icon={CheckCircle2}
        title="You represent this client"
        body="You accepted this referral. The client’s details are unlocked below."
      />
    );
  }

  // The referral is in an open dispute and I don't hold the case.
  if (isUnderReview(detail)) {
    // My invite is still live, but paused by another firm's report.
    if (detail.status === InvitationStatus.ACTIVE) {
      return (
        <Notice
          tone="info"
          icon={Clock}
          title="This referral is paused — under review"
          body="Another firm reported an off-platform signing. Your invitation is on hold while Lexamica reviews the potential duplicate representation. We won’t show a confident outcome until it’s resolved."
        />
      );
    }
    // My invite had closed and I reported an off-platform signing.
    return (
      <Notice
        tone="info"
        icon={Clock}
        title="Reported — under review"
        body="You reported an off-platform signing. Lexamica is reviewing a potential duplicate representation. We won’t show a confident outcome until it’s resolved."
      />
    );
  }

  // Live (buttons in the header) and can-report (banner at the bottom) are
  // handled elsewhere — nothing to show in this slot.
  if (isInvitationLive(detail) || canReportSigning(detail)) return null;

  return (
    <Notice
      tone="muted"
      title="This referral is closed"
      body="No further action available."
    />
  );
}
