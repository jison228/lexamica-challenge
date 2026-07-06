import type { ReactNode } from 'react';
import type { User } from '@/domain/user/types';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { TopProgress } from './TopProgress';

/** Authenticated application chrome: left nav + top bar + scrollable content. */
export function AppShell({
  user,
  children,
}: {
  user: User;
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={user} />
        <TopProgress />
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
