import { useNavigate } from 'react-router-dom';
import { Card, Button, DataState, useToast } from '@/components/ui';
import { usePreferences } from '@/hooks/queries';
import { useSavePreferences, useSignOut } from '@/hooks/mutations';
import { cn } from '@/lib/format';
import type { Preferences } from '@/types/db';

const sizes: { id: Preferences['font_scale']; label: string; px: number }[] = [
  { id: 'md', label: 'Normal', px: 17 }, { id: 'lg', label: 'Large', px: 20 }, { id: 'xl', label: 'Extra large', px: 24 },
];
const themes: { id: Preferences['reader_theme']; label: string; cls: string }[] = [
  { id: 'light', label: 'Light', cls: 'bg-white text-navy' },
  { id: 'sepia', label: 'Sepia', cls: 'bg-[#F4ECD8] text-[#3B2F1E]' },
  { id: 'dark', label: 'Dark', cls: 'bg-[#1D2733] text-[#E8E2D0]' },
];

/** Child settings: reading comfort only. Rules and limits are set by the parent. */
export function ChildSettings() {
  const prefs = usePreferences();
  const save = useSavePreferences();
  const signOut = useSignOut();
  const toast = useToast();
  const navigate = useNavigate();
  const p = prefs.data;
  const set = (patch: Partial<Preferences>): void => save.mutate(patch, { onSuccess: () => toast.success('Saved') });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold uppercase tracking-wide">Settings</h1>
      <DataState isLoading={prefs.isLoading} error={prefs.error}>
        {p && (
          <>
            <Card className="space-y-3">
              <h2 className="font-semibold">Text size</h2>
              <div className="flex gap-3" role="group" aria-label="Text size">
                {sizes.map((s) => (
                  <button key={s.id} type="button" aria-pressed={p.font_scale === s.id} onClick={() => set({ font_scale: s.id })}
                    className={cn('flex-1 rounded-2xl py-4 font-serif font-semibold', p.font_scale === s.id ? 'bg-navy text-cream' : 'bg-cream')} style={{ fontSize: s.px }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </Card>
            <Card className="space-y-3">
              <h2 className="font-semibold">Page colour</h2>
              <div className="flex gap-3" role="group" aria-label="Page colour">
                {themes.map((t) => (
                  <button key={t.id} type="button" aria-pressed={p.reader_theme === t.id} onClick={() => set({ reader_theme: t.id })}
                    className={cn('flex-1 rounded-2xl border-4 py-4 font-serif font-semibold', t.cls, p.reader_theme === t.id ? 'border-accent' : 'border-transparent')}>
                    {t.label}
                  </button>
                ))}
              </div>
            </Card>
            <Card tone="cream" className="flex items-center justify-between gap-4">
              <p className="font-serif text-sm">Game blocking and play-time limits are set by your parent in the GameRead Parent dashboard.</p>
              <Button variant="ghost" className="shrink-0 whitespace-nowrap" onClick={() => signOut.mutate(undefined, { onSuccess: () => navigate('/') })}>Switch user</Button>
            </Card>
          </>
        )}
      </DataState>
    </div>
  );
}
