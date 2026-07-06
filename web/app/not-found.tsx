import { NotFoundContent } from '@/components/common/NotFoundContent';

/** Global 404 — standalone (for routes outside the app shell). */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <NotFoundContent />
    </div>
  );
}
