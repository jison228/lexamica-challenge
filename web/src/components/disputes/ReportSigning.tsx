'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { reportKind } from '@/domain/dispute/logic';
import { ReportKind } from '@/domain/dispute/types';
import { useReportSigning } from '@/domain/dispute/hooks';
import { ApiError } from '@/api/client';
import { Modal } from '@/components/ui/modal';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { dateInputToISO, todayInputValue } from '@/lib/dates';
import type { InvitationDetail } from '@/domain/invitation/types';

const schema = z.object({
  signedAt: z
    .string()
    .refine((v) => !v || v <= todayInputValue(), 'A signing can’t be in the future')
    .optional(),
  statement: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

/** Copy + styling differ by whether the report will claim an open case or
 * contest one another firm holds. Collected here so the JSX stays branch-free. */
interface Copy {
  variant: ButtonProps['variant'];
  bannerBody: string;
  bannerCta: string;
  modalTitle: string;
  modalDescription: string;
  statementLabel: string;
  statementPlaceholder: string;
  submitLabel: string;
}

const CLAIM: Copy = {
  variant: 'primary',
  bannerBody:
    'Your invitation has closed — but if you signed this client, you can still claim the referral.',
  bannerCta: 'Claim this case',
  modalTitle: 'Claim this referral',
  modalDescription:
    'Confirm you signed this client. If no other firm has taken it, the referral becomes yours.',
  statementLabel: 'Notes (optional)',
  statementPlaceholder: 'Optional context…',
  submitLabel: 'Claim this case',
};

const DISPUTE: Copy = {
  variant: 'destructive',
  bannerBody:
    'This case is currently held by another firm. Reporting your signing opens a duplicate-representation review.',
  bannerCta: 'Report a signing & open a dispute',
  modalTitle: 'Report an off-platform signing',
  modalDescription:
    'Provide the details that support your claim. You will not see the other firm’s client information — an adjudicator compares both submissions.',
  statementLabel: 'Supporting statement / evidence',
  statementPlaceholder: 'Engagement date, retainer, documents you can produce…',
  submitLabel: 'Submit & open dispute',
};

/**
 * Bottom-of-page prompt to report an off-platform signing on a closed invitation.
 * A yellow banner whose button opens a modal with the claim/dispute form. The
 * server decides claim vs dispute finally, so if it becomes a dispute mid-submit
 * the detail simply re-renders into the "under review" state.
 */
export function ReportSigning({ detail }: { detail: InvitationDetail }) {
  const copy = reportKind(detail) === ReportKind.DISPUTE ? DISPUTE : CLAIM;
  const report = useReportSigning(detail.invitationId);
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { signedAt: '', statement: '' },
  });

  const onSubmit = handleSubmit((values) => {
    report.mutate(
      {
        signedAt: dateInputToISO(values.signedAt ?? ''),
        statement: values.statement?.trim() || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
      },
    );
  });

  const serverError = report.error instanceof ApiError ? report.error.message : null;

  return (
    <>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-900">
          Did you sign this client outside the platform?
        </p>
        <p className="mt-1 text-sm text-amber-800">{copy.bannerBody}</p>
        <Button className="mt-3" variant={copy.variant} onClick={() => setOpen(true)}>
          {copy.bannerCta}
        </Button>
      </div>

      <Modal
        open={open}
        onClose={() => {
          if (!report.isPending) setOpen(false);
        }}
        title={copy.modalTitle}
        description={copy.modalDescription}
      >
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="signedAt">When did you sign the client?</Label>
            <Input id="signedAt" type="date" max={todayInputValue()} {...register('signedAt')} />
            {errors.signedAt && (
              <p className="text-xs text-destructive">{errors.signedAt.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="statement">{copy.statementLabel}</Label>
            <Textarea
              id="statement"
              placeholder={copy.statementPlaceholder}
              {...register('statement')}
            />
          </div>
          {serverError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {serverError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={report.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant={copy.variant} loading={report.isPending}>
              {copy.submitLabel}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
