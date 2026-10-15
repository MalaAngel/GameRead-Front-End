import { cn } from '@/lib/format';

const palette = ['#EDB4E8', '#C5E6FF', '#F7D046', '#A8E0C5'];

export function Avatar({ name, size = 96, className }: { name: string; size?: number; className?: string }) {
  const initials = name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const color = palette[name.length % palette.length];
  return (
    <div
      className={cn('flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-navy', className)}
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
      role="img" aria-label={name}
    >
      {initials}
    </div>
  );
}
