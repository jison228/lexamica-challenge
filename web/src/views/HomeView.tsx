'use client';

import Link from 'next/link';
import { useInbox } from '@/domain/invitation/hooks';
import { isHeldCase, isPendingInvitation, invitationUiState } from '@/domain/invitation/logic';
import { InvitationsTable } from '@/components/invitations/list/InvitationsTable';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { User } from '@/domain/user/types';
import type { InvitationSummary } from '@/domain/invitation/types';

export function HomeView({
  user,
  initialInbox,
}: {
  user: User;
  initialInbox: InvitationSummary[];
}) {
  const { data = initialInbox } = useInbox(initialInbox);

  const underReview = data.filter((i) => invitationUiState(i) === 'under_review');

  const stats = [
    {
      label: 'Pending referrals',
      value: data.filter(isPendingInvitation).length,
      hint: 'Not yet accepted',
      href: '/invitations',
    },
    {
      label: 'Active cases',
      value: data.filter(isHeldCase).length,
      hint: 'You represent the client',
      href: '/cases',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user.name.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground">Here is what is happening at {user.firm.name}.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-colors hover:border-foreground/25">
              <CardHeader className="pb-2">
                <CardDescription>{s.label}</CardDescription>
                <CardTitle className="text-3xl tabular-nums">{s.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{s.hint}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {underReview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cases under review</CardTitle>
            <CardDescription>
              A conflict has been flagged — an adjudicator is resolving it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvitationsTable
              items={underReview}
              columnLabel="Status"
              renderTrailing={() => <Badge tone="info">Under review</Badge>}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
