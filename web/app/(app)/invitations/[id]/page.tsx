import { notFound } from 'next/navigation';
import { getInvitationServer } from '@/domain/invitation/server';
import { InvitationDetail } from '@/components/invitations/detail/InvitationDetail';

/**
 * SSR the disclosure-gated detail as the first frame — `protectedDetails` is in
 * the payload only if this firm is the accepted firm. The client component then
 * keeps it live.
 */
export default async function InvitationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getInvitationServer(id);
  if (!detail) notFound();
  return <InvitationDetail id={id} initialData={detail} />;
}
