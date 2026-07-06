import { NotFoundContent } from '@/components/common/NotFoundContent';

/** 404 inside the authenticated app — renders in the content area, sidebar intact. */
export default function AppNotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <NotFoundContent />
    </div>
  );
}
