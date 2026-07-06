import { redirect } from 'next/navigation';
import { getMeServer } from '@/domain/user/server';
import { AppShell } from '@/components/layout/AppShell';

/**
 * Auth gate for the entire authenticated app. Runs on the server on every
 * navigation into this route group: it reads the session cookie, asks the API
 * who the user is, and redirects to /login if there's no valid session — so
 * protected pages never render (or ship any markup) to an unauthenticated user.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getMeServer();
  if (!user) redirect('/login');

  return <AppShell user={user}>{children}</AppShell>;
}
