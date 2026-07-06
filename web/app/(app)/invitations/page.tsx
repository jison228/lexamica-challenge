import { getInboxServer } from '@/domain/invitation/server';
import { PageHeader } from '@/components/common/PageHeader';
import { InvitationList } from '@/components/invitations/list/InvitationList';

export default async function InvitationsPage() {
  const inbox = await getInboxServer();
  return (
    <div>
      <PageHeader
        title="Pending Referrals"
        description="Referrals you've been invited to review. Accept before the invitation expires — or report an off-platform signing on one that has closed."
      />
      <InvitationList
        initialData={inbox}
        variant="invitations"
        emptyMessage="No invitations right now."
      />
    </div>
  );
}
