import type { ReactNode } from 'react';
import { AlertCircle, Inbox, Loader2 } from 'lucide-react';
import { Button } from './Button';

/** Standard loading / error / empty handling so every list behaves the same. */
export function DataState({ isLoading, error, isEmpty, emptyMessage = 'Nothing here yet.', onRetry, children }: {
  isLoading?: boolean; error?: unknown; isEmpty?: boolean; emptyMessage?: string; onRetry?: () => void; children: ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-navy-soft" role="status">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Loading…
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center" role="alert">
        <AlertCircle className="h-6 w-6 text-danger" aria-hidden />
        <p>{error instanceof Error ? error.message : 'Something went wrong.'}</p>
        {onRetry && <Button size="sm" variant="solid" onClick={onRetry}>Try again</Button>}
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center text-navy-soft">
        <Inbox className="h-6 w-6" aria-hidden />
        <p>{emptyMessage}</p>
      </div>
    );
  }
  return <>{children}</>;
}
