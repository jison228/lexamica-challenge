import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/dates';

/** Absolute expiry label — the one way we show invitation expiry, everywhere. */
export function ExpiresAt({
  date,
  icon = false,
  className,
}: {
  date: string;
  icon?: boolean;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap', className)}>
      {icon && <Clock className="h-3.5 w-3.5" />}
      Expires {formatDate(date)}
    </span>
  );
}
