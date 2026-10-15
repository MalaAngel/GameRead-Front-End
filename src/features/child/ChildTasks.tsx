import { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { BookCover, Button, Card, DataState, Pill, ProgressBar, TabPanel, Tabs } from '@/components/ui';
import { useActiveChild } from '@/hooks/useActiveChild';
import { useAssignments, useBooks } from '@/hooks/queries';
import { formatDate } from '@/lib/format';
import { StartSessionModal } from './StartSessionModal';

function dueLabel(iso: string): string {
  const d = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (d < 0) return 'Overdue';
  if (d === 0) return 'Due today';
  return `Due in ${d} day${d === 1 ? '' : 's'}`;
}

/** Child Assigned Tasks: books your parent asked you to read. */
export function ChildTasks() {
  const { childId } = useActiveChild();
  const assignments = useAssignments(childId);
  const books = useBooks();
  const [tab, setTab] = useState('todo');
  const [pick, setPick] = useState<string | undefined>();
  const [open, setOpen] = useState(false);

  const bookById = useMemo(() => new Map((books.data ?? []).map((b) => [b.id, b])), [books.data]);
  const todo = (assignments.data ?? []).filter((a) => a.status !== 'done');
  const done = (assignments.data ?? []).filter((a) => a.status === 'done');
  const list = tab === 'todo' ? todo : done;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold uppercase tracking-wide">Assigned Tasks</h1>
        <Tabs label="Task filter" value={tab} onChange={setTab} tabs={[{ id: 'todo', label: `To do (${todo.length})` }, { id: 'done', label: `Finished (${done.length})` }]} />
      </div>
      <DataState isLoading={assignments.isLoading || books.isLoading} error={assignments.error}
        isEmpty={list.length === 0} emptyMessage={tab === 'todo' ? 'Nothing assigned right now. Enjoy your free reading!' : 'No finished tasks yet.'}>
        <TabPanel id={tab} active>
          <ul className="space-y-3">
            {list.map((a) => {
              const b = bookById.get(a.book_id);
              if (!b) return null;
              return (
                <li key={a.id}>
                  <Card className="flex items-center gap-5 py-4">
                    <BookCover book={b} size="sm" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold">{b.title}</h2>
                        {a.status === 'done'
                          ? <Pill tone="ok"><CheckCircle2 className="h-4 w-4" aria-hidden />Finished</Pill>
                          : <Pill tone={dueLabel(a.due_date) === 'Overdue' ? 'danger' : 'cream'}>{dueLabel(a.due_date)} · {formatDate(a.due_date)}</Pill>}
                      </div>
                      <p className="text-sm text-navy-soft">Goal: read for {a.target_minutes} minutes</p>
                      <ProgressBar value={a.progress_pct} max={100} showKnob={false} fill="navy" label={`${b.title} progress`} />
                      <p className="text-xs">{a.progress_pct}% complete</p>
                    </div>
                    {a.status !== 'done' && (
                      <Button variant="solid" onClick={() => { setPick(a.book_id); setOpen(true); }}>
                        {a.status === 'in_progress' ? 'Keep reading' : 'Start reading'}
                      </Button>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        </TabPanel>
      </DataState>
      <StartSessionModal open={open} onClose={() => setOpen(false)} preselectBookId={pick} />
    </div>
  );
}
