import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookCover, Button, DataState, Modal, useToast } from '@/components/ui';
import { useActiveChild } from '@/hooks/useActiveChild';
import { useCurrentReads, useLiveState, useRewardSettings, useSessions } from '@/hooks/queries';
import { useStartSession } from '@/hooks/mutations';

/** Start-session dialog (F-04). If a session is already running it offers to resume instead. */
export function StartSessionModal({ open, onClose, preselectBookId }: { open: boolean; onClose: () => void; preselectBookId?: string }) {
  const { childId } = useActiveChild();
  const reads = useCurrentReads(childId);
  const live = useLiveState(childId);
  const sessions = useSessions(childId);
  const rewards = useRewardSettings(childId);
  const start = useStartSession();
  const navigate = useNavigate();
  const toast = useToast();
  const [bookId, setBookId] = useState<string | undefined>(preselectBookId);

  useEffect(() => {
    if (open) setBookId(preselectBookId ?? reads.data?.[0]?.id);
  }, [open, preselectBookId, reads.data]);

  const active = sessions.data?.find((s) => s.id === live.data?.session_id);
  const perHour = rewards.data ? Math.floor(60 * rewards.data.ratio) : 0;

  const begin = (): void => {
    if (!childId || !bookId) return;
    start.mutate({ childId, bookId }, {
      onSuccess: () => { onClose(); navigate(`/child/read/${bookId}`); },
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <Modal
      open={open} onClose={onClose} title={active ? 'Reading session in progress' : 'Start a reading session'}
      footer={active ? (
        <>
          <Button variant="ghost" onClick={onClose}>Not now</Button>
          <Button onClick={() => { onClose(); navigate(`/child/read/${active.book_id}`); }}>Resume reading</Button>
        </>
      ) : (
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={begin} disabled={!bookId} loading={start.isPending}>Start reading</Button>
        </>
      )}
    >
      {active ? (
        <p className="font-serif text-lg">You already have a session running. Pick up where you left off.</p>
      ) : (
        <>
          <p className="mb-3 font-serif">Pick a book:</p>
          <DataState isLoading={reads.isLoading} error={reads.error} isEmpty={reads.data?.length === 0} emptyMessage="Add a book to Current Reads first.">
            <div className="flex flex-wrap justify-center gap-5">
              {reads.data?.map((b) => (
                <BookCover key={b.id} book={b} size="md" selected={b.id === bookId} onClick={() => setBookId(b.id)} />
              ))}
            </div>
          </DataState>
          <ul className="mt-5 space-y-1 font-serif text-sm">
            <li>Games and apps on your parent’s blocked list will pause while you read.</li>
            <li>Read for an hour and you can earn about {perHour} minutes of play time.</li>
          </ul>
        </>
      )}
    </Modal>
  );
}
