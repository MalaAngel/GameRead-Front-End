import { cn } from '@/lib/format';

export interface TabItem { id: string; label: string; badge?: number }

export function Tabs({ tabs, value, onChange, label = 'Sections' }: {
  tabs: TabItem[]; value: string; onChange: (id: string) => void; label?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex gap-1 rounded-pill bg-blue p-1">
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id} role="tab" type="button" id={`tab-${t.id}`} aria-selected={active} aria-controls={`panel-${t.id}`}
            tabIndex={active ? 0 : -1} onClick={() => onChange(t.id)}
            onKeyDown={(e) => {
              const i = tabs.findIndex((x) => x.id === value);
              if (e.key === 'ArrowRight') onChange(tabs[(i + 1) % tabs.length].id);
              if (e.key === 'ArrowLeft') onChange(tabs[(i - 1 + tabs.length) % tabs.length].id);
            }}
            className={cn('rounded-pill px-5 py-2 text-sm font-semibold transition-colors',
              active ? 'bg-navy text-cream' : 'text-navy hover:bg-blue-deep/40')}
          >
            {t.label}
            {!!t.badge && (
              <span className="ml-2 rounded-full bg-danger px-1.5 py-0.5 text-xs text-white">{t.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ id, active, children }: { id: string; active: boolean; children: React.ReactNode }) {
  if (!active) return null;
  return <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`}>{children}</div>;
}
