import { redirect } from 'next/navigation';
import { getMeServer } from '@/domain/user/server';
import { getInboxServer } from '@/domain/invitation/server';
import { HomeView } from '@/views/HomeView';

/** Home dashboard at `/`. The (app) layout already gated auth; we re-read the
 * user + inbox server-side so the first frame is complete. */
export default async function HomePage() {
  const user = await getMeServer();
  if (!user) redirect('/login');
  const inbox = await getInboxServer();
  return <HomeView user={user} initialInbox={inbox} />;
}
