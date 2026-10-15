import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, FlaskConical } from 'lucide-react';
import { useActiveChild } from '@/hooks/useActiveChild';
import { useDemoSignIn, useFireAlert, useParentOverride, useResetDemo, useSimulateBlockedApp } from '@/hooks/mutations';
import { getDemoSpeed, setDemoSpeed } from '@/lib/demo';
import { useToast } from '@/components/ui';
import { cn } from '@/lib/format';

/**
 * Floating demo panel. It stands in for the device agent and the parent's actions so a reviewer
 * can walk through lockdown, override and tamper alerts without a backend.
 */
export function DemoToolbar() {
  const [open, setOpen] = useState(false);
  const [speed, setSpeed] = useState(getDemoSpeed());
  const { childId } = useActiveChild();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const toast = useToast();
  const demoIn = useDemoSignIn();
  const blocked = useSimulateBlockedApp();
  const override = useParentOverride();
  const alert = useFireAlert();
  const reset = useResetDemo();

  const btn = 'w-full rounded-xl bg-blue px-3 py-2 text-left text-sm font-medium text-navy hover:bg-blue-deep disabled:opacity-50';
  const needChild = !childId;
  // the panel closes after each action so it never covers the reader's controls
  const ok = (m: string) => ({ onSuccess: () => { toast.success(m); setOpen(false); }, onError: (e: Error) => toast.error(e.message) });

  const switchTo = (role: 'parent' | 'child'): void =>
    demoIn.mutate(role, { onSuccess: () => { setOpen(false); navigate(role === 'parent' ? '/parent' : '/child'); } });

  return (
    <div className="fixed bottom-3 right-3 z-[70] w-64 text-navy">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
        className="ml-auto flex items-center gap-2 rounded-pill bg-navy px-4 py-2 text-sm font-semibold text-cream shadow-window">
        <FlaskConical className="h-4 w-4" aria-hidden />Demo tools{open ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </button>
      {open && (
        <div className={cn('mt-2 space-y-2 rounded-2xl bg-cream p-3 shadow-window')} role="region" aria-label="Demo tools">
          <p className="px-1 text-xs text-navy-soft">Simulates the device agent and parent actions (no backend yet).</p>
          <div className="grid grid-cols-2 gap-2">
            <button className={btn} onClick={() => switchTo('parent')} disabled={demoIn.isPending}>View as parent</button>
            <button className={btn} onClick={() => switchTo('child')} disabled={demoIn.isPending}>View as child</button>
          </div>
          <button className={btn} disabled={needChild} onClick={() => childId && blocked.mutate({ childId }, ok('Blocked app launched'))}>Simulate blocked app launch</button>
          <button className={btn} disabled={needChild} onClick={() => childId && blocked.mutate({ childId, variant: 'task_switch' }, ok('Task switch attempted'))}>Simulate task switching</button>
          <button className={btn} disabled={needChild} onClick={() => childId && override.mutate(childId, ok('Parent override sent'))}>Parent override: end lockdown</button>
          <button className={btn} disabled={needChild} onClick={() => childId && alert.mutate({ childId, type: 'terminate_attempt' }, ok('Tamper alert fired'))}>Fire tamper alert</button>
          <label className="block px-1 text-xs font-semibold" htmlFor="speed">Reading clock speed</label>
          <select id="speed" value={speed} onChange={(e) => { const v = Number(e.target.value); setSpeed(v); setDemoSpeed(v); }}
            className="h-9 w-full rounded-xl border border-navy/40 bg-white px-2 text-sm">
            <option value={1}>Real time (1×)</option>
            <option value={10}>Fast (10×)</option>
            <option value={60}>1 second = 1 minute (60×)</option>
          </select>
          <button className={btn} onClick={() => reset.mutate(undefined, { onSuccess: () => { toast.success('Demo data reset'); setOpen(false); if (pathname.startsWith('/child/read')) navigate('/child'); } })}>Reset demo data</button>
        </div>
      )}
    </div>
  );
}
