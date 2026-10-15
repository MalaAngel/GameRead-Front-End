import { BookOpen, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/format';

/** GAME / READ wordmark: a controller stands in for the M, an open book for the E. */
export function Logo({ subtitle, className }: { subtitle?: string; className?: string }) {
  const letters = 'font-light tracking-[0.35em] text-[28px] leading-none';
  return (
    <div className={cn('select-none text-navy', className)} aria-label={`GameRead${subtitle ? ' ' + subtitle : ''}`} role="img">
      <div className="flex items-end gap-1" aria-hidden>
        <span className={letters}>GA</span>
        <Gamepad2 className="h-8 w-9 text-navy" strokeWidth={1.4} fill="#F6D8F3" />
        <span className={letters}>E</span>
      </div>
      <div className="mt-1 flex items-end gap-1" aria-hidden>
        <span className={letters}>R</span>
        <BookOpen className="h-8 w-9 text-navy" strokeWidth={1.4} fill="#C5E6FF" />
        <span className={letters}>AD</span>
      </div>
      {subtitle && <div className="mt-1 text-xl font-light tracking-[0.2em]" aria-hidden>{subtitle}</div>}
    </div>
  );
}
