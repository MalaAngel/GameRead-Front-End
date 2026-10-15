import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Logo } from './Logo';
import { cn } from '@/lib/format';

export interface NavItem { label: string; to: string; end?: boolean; badge?: number }

/**
 * Shared sidebar. `variant="plain"` sits directly on the pink child window;
 * `variant="card"` is the blue rounded panel from the parent dashboard slide.
 */
export function Sidebar({ items, settingsTo, variant = 'plain', subtitle, footer, className }: {
  items: NavItem[]; settingsTo: string; variant?: 'plain' | 'card'; subtitle?: string; footer?: ReactNode; className?: string;
}) {
  return (
    <nav
      aria-label="Main"
      className={cn('flex w-[200px] shrink-0 flex-col items-center gap-8 py-8',
        variant === 'card' && 'rounded-card bg-blue px-0', className)}
    >
      <Logo subtitle={subtitle} className="scale-[0.8] origin-top" />
      <ul className="flex w-full flex-1 flex-col gap-1">
        {items.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to} end={it.end}
              className={({ isActive }) => cn(
                'flex h-11 w-full items-center justify-center gap-2 text-base uppercase tracking-wide transition-colors',
                isActive ? 'bg-accent font-semibold text-white' : 'hover:bg-navy-faint',
              )}
            >
              {it.label}
              {!!it.badge && <span className="rounded-full bg-danger px-1.5 text-xs text-white">{it.badge}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
      <NavLink
        to={settingsTo}
        className={({ isActive }) => cn(
          'flex h-11 w-full items-center justify-center gap-3 text-base uppercase tracking-wide',
          isActive ? 'bg-accent font-semibold text-white' : 'hover:bg-navy-faint',
        )}
      >
        Settings <Settings className="h-6 w-6" aria-hidden />
      </NavLink>
      {footer}
    </nav>
  );
}
