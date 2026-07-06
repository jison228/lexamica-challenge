'use client';

import { useState, type ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';
import { isInvitationLive } from '@/domain/invitation/logic';
import { isUnderReview } from '@/domain/dispute/logic';
import { useForceExpire } from '@/domain/invitation/hooks';
import { useResolveDispute } from '@/domain/dispute/hooks';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import type { InvitationDetail } from '@/domain/invitation/types';

/**
 * Demo controls, tucked behind a "?" button next to the title. Opens a modal to
 * simulate the events the platform can't control on its own: force time forward
 * (expire the live invite → advance the sequence) and stand in for the human
 * adjudicator (resolve an open dispute).
 */
export function SimActions({ detail }: { detail: InvitationDetail }) {
  const [open, setOpen] = useState(false);
  const expire = useForceExpire();
  const resolve = useResolveDispute(detail.invitationId);

  const showExpire = isInvitationLive(detail);
  const showResolve = isUnderReview(detail);
  if (!showExpire && !showResolve) return null;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Demo controls"
        title="Demo controls"
        className="h-6 w-6 shrink-0 rounded-full border border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Demo controls"
        description="Simulate the events the platform can't control on its own, to walk through the flows."
      >
        <div className="space-y-4">
          {showExpire && (
            <ControlRow
              title="Simulate expiry"
              body="Force the live invitation to expire and advance to the next candidate firm."
              action={
                <Button
                  size="sm"
                  variant="outline"
                  loading={expire.isPending}
                  onClick={() => expire.mutate(detail.invitationId)}
                >
                  Run
                </Button>
              }
            />
          )}
          {showResolve && (
            <ControlRow
              title="Resolve dispute"
              body="Stand in for the human adjudicator and award the case to your firm."
              action={
                <Button
                  size="sm"
                  variant="outline"
                  loading={resolve.isPending}
                  onClick={() => resolve.mutate()}
                >
                  Run
                </Button>
              }
            />
          )}
        </div>
      </Modal>
    </>
  );
}

function ControlRow({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{body}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}
