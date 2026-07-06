import { getInboxServer } from '@/domain/invitation/server';
import { PageHeader } from '@/components/common/PageHeader';
import { InvitationList } from '@/components/invitations/list/InvitationList';

export default async function CasesPage() {
  const inbox = await getInboxServer();
  return (
    <div>
      <PageHeader
        title="Cases"
        description="Referrals you've accepted. Client details are unlocked here."
      />
      <InvitationList
        initialData={inbox}
        variant="cases"
        emptyMessage="You haven't accepted any referrals yet."
      />
    </div>
  );
}
