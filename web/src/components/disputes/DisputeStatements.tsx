'use client';

import { useState, type FormEvent } from 'react';
import { MessageSquare } from 'lucide-react';
import { useAddDisputeStatement } from '@/domain/dispute/hooks';
import { ApiError } from '@/api/client';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { InvitationDetail } from '@/domain/invitation/types';
import { formatDate } from '@/lib/dates';

/**
 * Under-review only: a button opening a modal to submit a statement to Lexamica
 * about the dispute. Private to the adjudicator — the API returns only this
 * firm's own submissions, so a firm never sees the other side's.
 */
export function DisputeStatements({ detail }: { detail: InvitationDetail }) {
  const [open, setOpen] = useState(false);
  const add = useAddDisputeStatement(detail.invitationId);
  const [statement, setStatement] = useState('');
  const err = add.error instanceof ApiError ? add.error.message : null;
  const count = detail.disputeStatements.length;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = statement.trim();
    if (!text) return;
    add.mutate(text, { onSuccess: () => setStatement('') });
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <MessageSquare className="h-4 w-4" />
        View / Send Statements
      </Button>

      <Modal
        open={open}
        onClose={() => {
          if (!add.isPending) setOpen(false);
        }}
        title="Statements to Lexamica"
        description="Share anything that supports your position."
      >
        <div className="space-y-4">
          {count > 0 && (
            <ul className="space-y-2">
              {detail.disputeStatements.map((s) => (
                <li key={s.occurredAt} className="rounded-md border border-border bg-secondary/40 p-3">
                  <p className="text-sm">{s.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(s.occurredAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={submit} className="space-y-2">
            <Label htmlFor="dispute-statement" className="sr-only">
              Your statement
            </Label>
            <Textarea
              id="dispute-statement"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Add a statement for the adjudicator…"
            />
            {err && <p className="text-xs text-destructive">{err}</p>}
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                loading={add.isPending}
                disabled={!statement.trim()}
              >
                Send
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
