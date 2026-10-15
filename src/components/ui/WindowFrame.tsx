import type { ReactNode } from 'react';
import { Copy, Minus, X } from 'lucide-react';
import { cn } from '@/lib/format';

/**
 * Fixed 1000x700 desktop-style window used for the child client.
 * The title-bar buttons are visual only (the prototype runs in a browser) except `onClose`.
 */
export function WindowFrame({ children, tone = 'pink', onClose, className }: {
  children: ReactNode; tone?: 'pink' | 'cream'; onClose?: () => void; className?: string;
}) {
  return (
    <div className="flex min-h-full items-center justify-center overflow-auto p-4">
      <div
        className={cn('relative h-[700px] w-[1000px] shrink-0 overflow-hidden rounded-2xl shadow-window',
          tone === 'pink' ? 'bg-pink' : 'bg-cream', className)}
        role="application" aria-label="GameRead window"
      >
        <div className="absolute right-5 top-4 z-20 flex items-center gap-4 text-navy">
          <button type="button" aria-label="Minimise" className="rounded p-1 hover:bg-navy-faint"><Minus className="h-6 w-6" strokeWidth={3} /></button>
          <button type="button" aria-label="Maximise" className="rounded p-1 hover:bg-navy-faint"><Copy className="h-5 w-5" strokeWidth={2.5} /></button>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded p-1 hover:bg-navy-faint"><X className="h-6 w-6" strokeWidth={3} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
