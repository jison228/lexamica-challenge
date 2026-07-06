import { Lock } from 'lucide-react';
import type { InvitationDetail } from '@/domain/invitation/types';

/**
 * The disclosure surface. `publicSummary` is always shown. `protectedDetails`
 * renders ONLY when the server sent them (this firm is the accepted firm) —
 * there's no client-side gate to bypass, because the data isn't in the payload
 * otherwise.
 */
export function DisclosurePanel({ detail }: { detail: InvitationDetail }) {
  const s = detail.publicSummary;
  const p = detail.protectedDetails;

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">Case summary</h3>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <Field label="Case type" value={s.caseType} />
          <Field label="Jurisdiction" value={s.state} />
          <Field label="Estimated value" value={s.estimatedValueRange} />
          <Field label="Description" value={s.description} full />
        </dl>
      </section>

      <section>
        <h3 className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          {p ? 'Client details' : (
            <>
              <Lock className="h-3.5 w-3.5" /> Client details — locked
            </>
          )}
        </h3>
        {p ? (
          <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <Field label="Client name" value={p.clientName} />
            <Field label="Contact" value={p.clientContact} />
            <Field label="Narrative" value={p.narrative} full />
          </dl>
        ) : (
          <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            The client&apos;s identifying details are released only to the firm that accepts
            this referral.
          </p>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  full,
}: {
  label: string;
  value?: string;
  full?: boolean;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : undefined}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value ?? '—'}</dd>
    </div>
  );
}
