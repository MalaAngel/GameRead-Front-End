import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { useActiveChild } from '@/hooks/useActiveChild';
import { useRewardSettings, useWallet } from '@/hooks/queries';
import { formatDuration } from '@/lib/format';
import type { ReadingSession } from '@/types/db';

/** End-of-session summary: verified minutes, pages and the play time earned (F-07). */
export function SessionSummaryModal({ session, onDone }: { session: ReadingSession | null; onDone: () => void }) {
  const { childId } = useActiveChild();
  const rewards = useRewardSettings(childId);
  const wallet = useWallet(childId);
  const [shown, setShown] = useState(0);

  const bonus = session?.bonus_minutes ?? 0;
  useEffect(() => {
    if (!session) { setShown(0); return; }
    setShown(0);
    if (bonus === 0) return;
    const step = Math.max(1, Math.ceil(bonus / 30));
    const id = setInterval(() => setShown((v) => { const next = Math.min(bonus, v + step); if (next >= bonus) clearInterval(id); return next; }), 40);
    return () => clearInterval(id);
  }, [session, bonus]);

  if (!session) return null;
  const rawEarned = Math.floor(session.verified_minutes * (rewards.data?.ratio ?? 0));
  const capped = rawEarned > bonus;

  return (
    <Modal open onClose={onDone} dismissible={false} title={session.ended_by === 'parent' ? 'Session ended by your parent' : 'Great reading!'}
      footer={<Button size="lg" onClick={onDone} autoFocus>Back to home</Button>}>
      <div className="space-y-5 text-center">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-pill bg-blue px-6 py-3 text-3xl font-semibold">
          <Sparkles className="h-7 w-7 text-accent" aria-hidden />
          <span aria-live="polite">+{shown} min</span>
        </div>
        <p className="font-serif text-lg">play time unlocked</p>
        <dl className="mx-auto grid max-w-sm grid-cols-2 gap-3 text-left">
          <dt className="text-navy-soft">Time read</dt><dd className="text-right font-semibold">{formatDuration(session.verified_minutes)}</dd>
          <dt className="text-navy-soft">Pages read</dt><dd className="text-right font-semibold">{session.pages_read}</dd>
          <dt className="text-navy-soft">Play balance</dt><dd className="text-right font-semibold">{formatDuration(wallet.data?.balance_minutes ?? 0)}</dd>
        </dl>
        {capped && <p className="font-serif text-sm text-warn">You’ve reached today’s play-time limit, so some minutes weren’t added.</p>}
        {session.verified_minutes === 0 && <p className="font-serif text-sm text-navy-soft">Read a little longer next time to earn play time.</p>}
      </div>
    </Modal>
  );
}
