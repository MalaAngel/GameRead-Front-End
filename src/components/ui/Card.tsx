import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/format';

type Tone = 'blue' | 'cream' | 'white' | 'pink';
const tones: Record<Tone, string> = {
  blue: 'bg-blue',
  cream: 'bg-cream',
  white: 'bg-white',
  pink: 'bg-pink-soft',
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  padded?: boolean;
}

/** The rounded card used all over the slides. */
export function Card({ tone = 'blue', padded = true, className, ...rest }: CardProps) {
  return <div className={cn('rounded-card', tones[tone], padded && 'p-6', className)} {...rest} />;
}
