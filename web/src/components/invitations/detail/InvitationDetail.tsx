'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAccept, useDecline, useInvitation } from '@/domain/invitation/hooks';
import { isInvitationLive } from '@/domain/invitation/logic';
import { canReportSigning } from '@/domain/dispute/logic';
import { ApiError } from '@/api/client';
import { Card, CardContent } from '@/components/ui/card';
import type { InvitationDetail as Detail } from '@/domain/invitation/types';
import { DetailHeader } from './DetailHeader';
import { DisclosurePanel } from './DisclosurePanel';
import { BodyStatus } from './BodyStatus';
import { Notice } from '@/components/common/Notice';
import { ReportSigning } from '@/components/disputes/ReportSigning';

export function InvitationDetail({
  id,
  initialData,
}: {
  id: string;
  initialData: Detail;
}) {
  const q = useInvitation(id, initialData);
  const detail = q.data ?? initialData;

  // Accept/decline live here, not in the header, because the parent also renders
  // the conflict Notice from `accept.error`. The accept is pending, not
  // optimistic — no premature "accepted" state, so nothing to roll back visually.
  const accept = useAccept(id);
  const decline = useDecline(id);

  const live = isInvitationLive(detail);
  const acceptError = accept.error instanceof ApiError ? accept.error : null;
  const backHref = detail.amAccepted ? '/cases' : '/invitations';

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <DetailHeader
        detail={detail}
        live={live}
        onAccept={() => accept.mutate()}
        onDecline={() => decline.mutate()}
        accepting={accept.isPending}
        declining={decline.isPending}
      />

      {acceptError && live && (
        <Notice
          tone="warning"
          icon={AlertTriangle}
          title="Couldn’t confirm your acceptance"
          body={acceptError.message}
        />
      )}

      <BodyStatus detail={detail} />

      <Card>
        <CardContent className="pt-6">
          <DisclosurePanel detail={detail} />
        </CardContent>
      </Card>

      {canReportSigning(detail) && <ReportSigning detail={detail} />}
    </div>
  );
}
