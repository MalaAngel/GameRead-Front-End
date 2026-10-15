import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useChildren, useCurrentUser } from './queries';
import type { Child } from '@/types/db';

interface ActiveChildValue {
  childId: string | undefined;
  child: Child | undefined;
  children: Child[];
  setChildId: (id: string) => void;
  isLoading: boolean;
}

const Ctx = createContext<ActiveChildValue | null>(null);

/**
 * Resolves "which child are we looking at":
 *  - child account  -> the paired child
 *  - parent account -> the child chosen in the switcher (defaults to the first)
 */
export function ActiveChildProvider({ children: kids }: { children: ReactNode }) {
  const user = useCurrentUser();
  const list = useChildren();
  const [selected, setSelected] = useState<string | undefined>(() => {
    try { return localStorage.getItem('gameread.activeChild') ?? undefined; } catch { return undefined; }
  });

  const all = useMemo(() => list.data ?? [], [list.data]);
  const fixed = user.data?.role === 'child' ? user.data.child_id ?? undefined : undefined;
  const childId = fixed ?? (all.find((c) => c.id === selected)?.id ?? all[0]?.id);

  useEffect(() => {
    try { if (childId) localStorage.setItem('gameread.activeChild', childId); } catch { /* ignore */ }
  }, [childId]);

  const value: ActiveChildValue = {
    childId,
    child: all.find((c) => c.id === childId),
    children: all,
    setChildId: setSelected,
    isLoading: user.isLoading || list.isLoading,
  };
  return <Ctx.Provider value={value}>{kids}</Ctx.Provider>;
}

export function useActiveChild(): ActiveChildValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useActiveChild must be used inside ActiveChildProvider');
  return v;
}
