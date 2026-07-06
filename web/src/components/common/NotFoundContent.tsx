import Link from 'next/link';
import { Compass } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Shared 404 content, used by both the global and in-app not-found boundaries. */
export function NotFoundContent() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
        <Compass className="h-7 w-7 text-accent-foreground" />
      </div>
      <p className="mt-6 text-sm font-medium text-muted-foreground">Error 404</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The referral or page you&apos;re looking for doesn&apos;t exist, or it may have moved.
      </p>
      <Link href="/" className={cn(buttonVariants(), 'mt-6')}>
        Back to Home
      </Link>
    </div>
  );
}
