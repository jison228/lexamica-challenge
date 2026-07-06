'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { login } from '@/domain/auth/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { User } from '@/domain/user/types';

// Demo identities (shared seed password). In production this is just the signed-in
// firm; here it doubles as a quick way to view the network from each firm's side.
const DEMO = [
  { email: 'alice@lexamica.com', name: 'Alice Avery', firm: 'Avery & Associates' },
  { email: 'bob@lexamica.com', name: 'Bob Brennan', firm: 'Brennan Injury Law' },
  { email: 'carol@lexamica.com', name: 'Carol Carter', firm: 'Carter Legal Group' },
];

export function FirmSwitcher({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const switchTo = async (email: string) => {
    if (email === user.email) return setOpen(false);
    setBusy(true);
    await login({ email, password: 'password' });
    window.location.assign('/');
  };

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        onClick={() => setOpen((o) => !o)}
        className="h-auto justify-start gap-2 px-2 py-1.5 text-left font-normal"
      >
        <span className="leading-tight">
          <span className="block text-sm font-medium">{user.firm.name}</span>
          <span className="block text-xs text-muted-foreground">
            {user.name} · {user.email}
          </span>
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-popover p-1 shadow-lg">
          <p className="px-2 py-1.5 text-xs text-muted-foreground">Switch firm (demo)</p>
          {DEMO.map((d) => {
            const active = d.email === user.email;
            return (
              <Button
                key={d.email}
                variant="ghost"
                onClick={() => switchTo(d.email)}
                disabled={busy}
                className={cn(
                  'h-auto w-full justify-between gap-2 px-2 py-1.5 text-left font-normal',
                  active && 'bg-secondary',
                )}
              >
                <span>
                  <span className="block text-sm font-medium">{d.firm}</span>
                  <span className="block text-xs text-muted-foreground">{d.name}</span>
                </span>
                {active && <Check className="h-4 w-4 shrink-0" />}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
