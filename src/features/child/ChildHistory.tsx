import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import { Button, Card, DataState, Duration, Meter, Modal, StatTile, TabPanel, Tabs, useToast } from '@/components/ui';
import { useActiveChild } from '@/hooks/useActiveChild';
import { useBooks, useLiveState, useRewardSettings, useSessions, useStats, useWallet } from '@/hooks/queries';
import { useEndPlay, useStartPlay } from '@/hooks/mutations';
import { getDemoSpeed } from '@/lib/demo';
import { formatDate, formatDuration, splitMinutes } from '@/lib/format';

function PlayCountdown({ minutes, onDone }: { minutes: number; onDone: () => void }) {
  const [left, setLeft] = useState(minutes * 60);
  const done = useRef(false);
  useEffect(() => {
    const id = setInterval(() => setLeft((l) => Math.max(0, l - getDemoSpeed())), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { if (left <= 0 && !done.current) { done.current = true; onDone(); } }, [left, onDone]);
  const m = Math.floor(left / 60), s = Math.floor(left % 60);
  return (
    <Modal open onClose={onDone} title="Play time!" size="sm" tone="blue" footer={<Button variant="solid" onClick={onDone}>Stop playing</Button>}>
      <p className="text-center text-6xl font-semibold tabular-nums" role="timer" aria-live="off">{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}</p>
      <p className="mt-3 text-center font-serif">Your games are unlocked. Have fun, and come back for more reading!</p>
    </Modal>
  );
}

/** History (sessions) and the play-time wallet. `?tab=wallet` opens the wallet directly. */
export function ChildHistory() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'wallet' ? 'wallet' : 'sessions';
  const { childId } = useActiveChild();
  const sessions = useSessions(childId);
  const books = useBooks();
  const stats = useStats(childId);
  const wallet = useWallet(childId);
  const rewards = useRewardSettings(childId);
  const live = useLiveState(childId);
  const startPlay = useStartPlay();
  const endPlay = useEndPlay();
  const toast = useToast();
  const [minutes, setMinutes] = useState(15);
  const [playing, setPlaying] = useState<number | null>(null);

  const titleOf = useMemo(() => new Map((books.data ?? []).map((b) => [b.id, b.title])), [books.data]);
  const ended = (sessions.data ?? []).filter((s) => s.state === 'ended');
  const w = wallet.data;
  const options = [15, 30, 45, 60].filter((m) => !w || m <= w.balance_minutes);
  const effective = w && minutes > w.balance_minutes ? (options.at(-1) ?? 0) : minutes;
  const sessionBlocking = !!live.data?.session_id;

  const play = (): void => {
    if (!childId || !effective) return;
    startPlay.mutate({ childId, minutes: effective }, {
      onSuccess: () => setPlaying(effective),
      onError: (e) => toast.error(e.message),
    });
  };
  const stopPlay = (): void => { setPlaying(null); if (childId) endPlay.mutate(childId); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold uppercase tracking-wide">History</h1>
        <Tabs label="History sections" value={tab} onChange={(id) => setParams(id === 'wallet' ? { tab: 'wallet' } : {})}
          tabs={[{ id: 'sessions', label: 'Reading sessions' }, { id: 'wallet', label: 'Play time' }]} />
      </div>

      <TabPanel id="sessions" active={tab === 'sessions'}>
        <div className="space-y-4">
          <Card className="grid grid-cols-2 gap-4 py-4">
            <StatTile label="Read this week" minutes={stats.data?.weekly_minutes ?? 0} />
            <StatTile label="Pages this week"><span className="text-4xl font-medium">{stats.data?.weekly_pages ?? 0}</span></StatTile>
          </Card>
          <Card tone="cream" className="p-0">
            <DataState isLoading={sessions.isLoading} error={sessions.error} isEmpty={ended.length === 0} emptyMessage="No reading sessions yet.">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Past reading sessions</caption>
                <thead><tr className="border-b border-navy/15 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3">Date</th><th className="px-3 py-3">Book</th><th className="px-3 py-3">Time</th><th className="px-3 py-3">Pages</th><th className="px-5 py-3 text-right">Play time earned</th>
                </tr></thead>
                <tbody>
                  {ended.map((s) => (
                    <tr key={s.id} className="border-b border-navy/10 last:border-0">
                      <td className="px-5 py-3">{formatDate(s.started_at)}</td>
                      <td className="px-3 py-3 font-medium">{titleOf.get(s.book_id) ?? 'Book'}</td>
                      <td className="px-3 py-3">{formatDuration(s.verified_minutes)}</td>
                      <td className="px-3 py-3">{s.pages_read}</td>
                      <td className="px-5 py-3 text-right font-semibold">+{s.bonus_minutes} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataState>
          </Card>
        </div>
      </TabPanel>

      <TabPanel id="wallet" active={tab === 'wallet'}>
        <DataState isLoading={wallet.isLoading} error={wallet.error} onRetry={() => void wallet.refetch()}>
          {w && (
            <div className="space-y-4">
              <Card className="space-y-3 py-5 text-center">
                <h2 className="text-sm uppercase tracking-wide">Play time you can use now</h2>
                <Duration minutes={w.balance_minutes} className="scale-125" />
                <p className="font-serif text-sm">
                  {rewards.data ? `Every hour you read earns about ${Math.floor(60 * rewards.data.ratio)} minutes of play time.` : ''}
                </p>
              </Card>
              <Card tone="cream" className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-semibold">Today’s limit</h2>
                  <span className="text-sm">{formatDuration(w.today_earned_minutes)} of {formatDuration(w.daily_cap_minutes)} earned</span>
                </div>
                <Meter value={w.today_earned_minutes} max={w.daily_cap_minutes} label="Play time earned today" />
                {w.cap_remaining_minutes === 0
                  ? <p className="text-sm text-warn">You’ve reached today’s maximum. Come back tomorrow!</p>
                  : <p className="text-sm text-navy-soft">You can still earn {formatDuration(w.cap_remaining_minutes)} today.</p>}
              </Card>
              <Card className="flex flex-wrap items-center gap-4">
                <label htmlFor="play-minutes" className="font-semibold">Play for</label>
                <select id="play-minutes" value={effective} onChange={(e) => setMinutes(Number(e.target.value))} disabled={options.length === 0}
                  className="h-12 rounded-xl border border-navy/40 bg-cream px-4 text-base">
                  {options.length === 0 && <option value={0}>No time yet</option>}
                  {options.map((m) => <option key={m} value={m}>{m} minutes</option>)}
                </select>
                <Button size="lg" variant="solid" icon={<Gamepad2 className="h-5 w-5" />} onClick={play} loading={startPlay.isPending}
                  disabled={!effective || sessionBlocking}>Start playing</Button>
                {sessionBlocking && <p className="w-full text-sm">Finish your reading session first, then you can play.</p>}
                {options.length === 0 && !sessionBlocking && <p className="w-full text-sm">Read a little more to earn play time.</p>}
              </Card>
              {(() => { const t = splitMinutes(w.spent_minutes); return <p className="text-center text-sm text-navy-soft">You’ve used {t.h}h {t.m}m of play time so far.</p>; })()}
            </div>
          )}
        </DataState>
      </TabPanel>
      {playing !== null && <PlayCountdown minutes={playing} onDone={stopPlay} />}
    </div>
  );
}
