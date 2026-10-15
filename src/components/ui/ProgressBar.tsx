import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/format';

interface ProgressBarProps {
  value: number;
  max: number;
  min?: number;
  /** If given the bar is a draggable slider (reader); otherwise it is read-only. */
  onChange?: (value: number) => void;
  label: string;
  className?: string;
  showKnob?: boolean;
  /** 'navy' for use on blue cards, where the default blue fill would disappear. */
  fill?: 'blue' | 'navy';
}

/** Blue-filled-on-pink track with an open-book knob, as in the reader slide. */
export function ProgressBar({ value, max, min = 0, onChange, label, className, showKnob = true, fill = 'blue' }: ProgressBarProps) {
  const pct = max === min ? 0 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  return (
    <div className={cn('relative h-8 w-full', className)}>
      <div className="absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 overflow-hidden rounded-pill bg-pink">
        <div className={cn('h-full rounded-pill transition-[width] duration-300', fill === 'navy' ? 'bg-navy' : 'bg-blue')} style={{ width: `${pct}%` }} />
      </div>
      {showKnob && (
        <div
          className="pointer-events-none absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue shadow-soft"
          style={{ left: `${Math.max(2, Math.min(98, pct))}%` }}
          aria-hidden
        >
          <BookOpen className="h-4 w-4 text-navy" />
        </div>
      )}
      {onChange ? (
        <input
          type="range" min={min} max={max} value={value} aria-label={label}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      ) : (
        <div role="progressbar" aria-label={label} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} className="absolute inset-0" />
      )}
    </div>
  );
}
