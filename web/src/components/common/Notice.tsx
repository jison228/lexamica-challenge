import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'success' | 'warning' | 'info' | 'muted';

const TONES: Record<Tone, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'border-border bg-accent text-accent-foreground',
  muted: 'border-border bg-muted text-muted-foreground',
};

export function Notice({
  tone,
  icon: Icon,
  title,
  body,
}: {
  tone: Tone;
  icon?: LucideIcon;
  title: string;
  body?: string;
}) {
  return (
    <div className={cn('flex items-start gap-3 rounded-lg border p-4', TONES[tone])}>
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0" />}
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {body && <p className="mt-0.5 text-sm opacity-90">{body}</p>}
      </div>
    </div>
  );
}
