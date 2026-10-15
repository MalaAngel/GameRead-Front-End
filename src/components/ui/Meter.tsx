import { cn } from '@/lib/format';

/** Simple horizontal meter (e.g. daily cap usage). */
export function Meter({ value, max, label, className }: { value: number; max: number; label: string; className?: string }) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  const full = pct >= 100;
  return (
    <div className={cn('h-4 w-full overflow-hidden rounded-pill bg-navy/15', className)}
      role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.min(value, max)}>
      <div className={cn('h-full rounded-pill transition-[width] duration-500', full ? 'bg-pink-deep' : 'bg-accent')} style={{ width: `${pct}%` }} />
    </div>
  );
}
