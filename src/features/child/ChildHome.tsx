import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Clock, Gamepad2, Plus } from 'lucide-react';
import { BookCover, Button, Card, DataState, Pill, StatTile } from '@/components/ui';
import { useActiveChild } from '@/hooks/useActiveChild';
import { useAssignments, useBooks, useCurrentReads, useLiveState, useWallet } from '@/hooks/queries';
import { formatDuration } from '@/lib/format';
import { StartSessionModal } from './StartSessionModal';
import { LibraryModal } from './LibraryModal';

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

/** Child home (slide 1, top): Read-Play converter + Current Reads. */
export function ChildHome() {
  const { childId } = useActiveChild();
  const wallet = useWallet(childId);
  const reads = useCurrentReads(childId);
  const assignments = useAssignments(childId);
  const books = useBooks();
  const live = useLiveState(childId);
  const [startOpen, setStartOpen] = useState(false);
  const [pick, setPick] = useState<string | undefined>();
  const [libOpen, setLibOpen] = useState(false);

  const w = wallet.data;
  const capReached = !!w && w.daily_cap_minutes > 0 && w.cap_remaining_minutes === 0;
  const nextTask = assignments.data?.find((a) => a.status !== 'done');
  const nextBook = books.data?.find((b) => b.id === nextTask?.book_id);
  const inSession = !!live.data?.session_id;

  return (
    <div className="space-y-4">
      <Card className="py-5">
        <h1 className="mb-2 text-center text-sm font-normal uppercase tracking-wide">Read–Play Converter</h1>
        <DataState isLoading={wallet.isLoading} error={wallet.error} onRetry={() => void wallet.refetch()}>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center">
            <StatTile label="Hours read" minutes={w?.total_read_minutes ?? 0} icon={<Clock className="h-16 w-16" strokeWidth={1.4} />} />
            <svg width="110" height="30" viewBox="0 0 110 30" aria-hidden>
              <path d="M0 15h96M84 3l14 12-14 12" stroke="#0B4470" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <StatTile label="Play hours unlocked" minutes={w?.total_earned_minutes ?? 0} icon={<Gamepad2 className="h-16 w-16" strokeWidth={1.4} />} />
          </div>
        </DataState>
      </Card>

      <Card className="flex items-center gap-5 py-5">
        <h2 className="w-24 shrink-0 text-xl font-light uppercase leading-tight">Current Reads</h2>
        <DataState isLoading={reads.isLoading} error={reads.error} isEmpty={reads.data?.length === 0} emptyMessage="No books yet. Tap More to add one.">
          <div className="flex flex-1 items-center gap-5 overflow-x-auto py-1 scroll-soft">
            {reads.data?.map((b) => (
              <BookCover key={b.id} book={b} onClick={() => { setPick(b.id); setStartOpen(true); }} />
            ))}
            <button type="button" onClick={() => setLibOpen(true)} className="flex shrink-0 flex-col items-center gap-1 text-sm uppercase" aria-label="More books">
              <Plus className="h-14 w-14 rounded-full border-2 border-navy p-2" aria-hidden />More
            </button>
          </div>
        </DataState>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" variant="solid" onClick={() => { setPick(undefined); setStartOpen(true); }}>
          {inSession ? 'Resume reading session' : 'Start reading session'}
        </Button>
        {w && (
          <Link to="/child/history?tab=wallet" className="rounded-pill focus-visible:outline-accent">
            <Pill tone="blue" className="px-5 py-3 text-base">
              <Gamepad2 className="h-5 w-5" aria-hidden />Play time available: {formatDuration(w.balance_minutes)}
            </Pill>
          </Link>
        )}
        {capReached && <Pill tone="warn" className="py-3">You’ve earned the maximum for today</Pill>}
        {nextTask && nextBook && (
          <Link to="/child/tasks" className="ml-auto">
            <Pill tone="cream" className="py-2.5">
              <CalendarClock className="h-4 w-4" aria-hidden />
              Due {daysUntil(nextTask.due_date) <= 0 ? 'today' : `in ${daysUntil(nextTask.due_date)} days`}: {nextBook.title}
            </Pill>
          </Link>
        )}
      </div>

      <StartSessionModal open={startOpen} onClose={() => setStartOpen(false)} preselectBookId={pick} />
      <LibraryModal open={libOpen} onClose={() => setLibOpen(false)} />
    </div>
  );
}
