import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui';
import { useActiveChild } from '@/hooks/useActiveChild';
import { useLiveState, useRewardSettings, useSessions, useWallet } from '@/hooks/queries';
import { useClearLockdown } from '@/hooks/mutations';
import { bonusMinutes } from '@/lib/reward';
import { formatDuration } from '@/lib/format';

/**
 * Lockdown notice (F-03). Rendered inside the child window whenever the device reports an active lockdown.
 * Variants: blocked app, task switch, and "parent ended lockdown". Cannot be dismissed any other way.
 */
export function LockdownGate() {
  const { childId } = useActiveChild();
  const live = useLiveState(childId);
  const sessions = useSessions(childId);
  const rewards = useRewardSettings(childId);
  const wallet = useWallet(childId);
  const clear = useClearLockdown();
  const navigate = useNavigate();

  const lock = live.data?.lockdown;
  if (!childId || !lock?.active) return null;

  const session = sessions.data?.find((s) => s.id === live.data?.session_id);
  const projected = session && rewards.data && wallet.data
    ? bonusMinutes(session.verified_minutes, rewards.data.ratio, wallet.data.cap_remaining_minutes)
    : 0;

  const isOverride = lock.variant === 'override';
  const title = isOverride
    ? 'Your parent ended lockdown'
    : lock.variant === 'task_switch' ? 'Stay with your book' : `${lock.app_name ?? 'That app'} is paused while you read`;
  const message = isOverride
    ? 'Your reading session has finished. Nice work today!'
    : lock.variant === 'task_switch'
      ? 'Switching to other windows is turned off during a reading session. Keep reading to earn play time!'
      : 'Finish your reading session to unlock play time. Every minute you read gets you closer!';

  const dismiss = (): void => {
    clear.mutate(childId, {
      onSuccess: () => {
        if (!isOverride && session) navigate(`/child/read/${session.book_id}`);
      },
    });
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-navy/85 p-10" role="alertdialog" aria-modal="true" aria-labelledby="lock-title" aria-describedby="lock-msg">
      <div className="w-full max-w-xl rounded-card bg-cream p-10 text-center shadow-window">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-pink">
          {isOverride ? <ShieldCheck className="h-10 w-10" /> : <Lock className="h-10 w-10" />}
        </div>
        <h2 id="lock-title" className="text-3xl font-semibold">{title}</h2>
        <p id="lock-msg" className="mt-3 font-serif text-lg">{message}</p>
        {!isOverride && session && (
          <p className="mt-5 inline-block rounded-pill bg-blue px-5 py-2 text-base font-medium">
            So far you have earned {formatDuration(projected)} of play time
          </p>
        )}
        <div className="mt-8">
          <Button size="lg" onClick={dismiss} loading={clear.isPending} autoFocus>
            {isOverride ? 'OK' : 'Back to reading'}
          </Button>
        </div>
      </div>
    </div>
  );
}
