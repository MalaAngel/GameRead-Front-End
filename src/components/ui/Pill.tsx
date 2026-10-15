import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/format';

type Tone = 'blue' | 'pink' | 'cream' | 'navy' | 'ok' | 'warn' | 'danger';
const tones: Record<Tone, string> = {
  blue: 'bg-blue text-navy',
  pink: 'bg-pink text-navy',
  cream: 'bg-cream text-navy',
  navy: 'bg-navy text-cream',
  ok: 'bg-[#D6F0E2] text-ok',
  warn: 'bg-[#FBE7C6] text-warn',
  danger: 'bg-[#F9D9D6] text-danger',
};

export function Pill({ tone = 'blue', className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-pill px-4 py-1.5 text-sm font-medium', tones[tone], className)}
      {...rest}
    />
  );
}
