import { redirect } from 'next/navigation';
import { getMeServer } from '@/domain/user/server';
import { LoginView } from '@/views/LoginView';

/** Public login route. If already authenticated, skip straight to the app. */
export default async function LoginPage() {
  const user = await getMeServer();
  if (user) redirect('/');
  return <LoginView />;
}
