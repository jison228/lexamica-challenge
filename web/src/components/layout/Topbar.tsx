'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMe } from '@/domain/user/hooks';
import { useLogout } from '@/domain/auth/hooks';
import { FirmSwitcher } from '@/components/common/FirmSwitcher';
import type { User } from '@/domain/user/types';

export function Topbar({ user }: { user: User }) {
  // Seeded from the server render, but reactive: a logout elsewhere or a
  // session change re-renders the header without a full reload.
  const { data } = useMe(user);
  const current = data ?? user;
  const logout = useLogout();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <FirmSwitcher user={current} />
      <Button
        variant="outline"
        size="sm"
        onClick={() => logout.mutate()}
        loading={logout.isPending}
      >
        {!logout.isPending && <LogOut className="h-4 w-4" />}
        Sign out
      </Button>
    </header>
  );
}
