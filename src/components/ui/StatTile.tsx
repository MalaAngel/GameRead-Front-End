import type { ReactNode } from 'react';
import { splitMinutes, cn } from '@/lib/format';

/** "10 HRS 43 MIN" in the slide's big-number style. */
export function Duration({ minutes, className }: { minutes: number; className?: string }) {
  const { h, m } = splitMinutes(minutes);
  return (
    <div className={cn('flex items-baseline justify-center gap-1.5 text-navy', className)} aria-label={`${h} hours ${m} minutes`}>
      <span className="text-4xl font-medium" aria-hidden>{h}</span>
      <span className="mr-2 text-sm uppercase" aria-hidden>hrs</span>
      <span className="text-4xl font-medium" aria-hidden>{m}</span>
      <span className="text-sm uppercase" aria-hidden>min</span>
    </div>
  );
}

export function StatTile({ label, icon, minutes, children, className }: {
  label: string; icon?: ReactNode; minutes?: number; children?: ReactNode; className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-2 text-center', className)}>
      <div className="text-sm font-medium uppercase tracking-wide">{label}</div>
      {icon}
      {minutes !== undefined && <Duration minutes={minutes} />}
      {children}
    </div>
  );
}
