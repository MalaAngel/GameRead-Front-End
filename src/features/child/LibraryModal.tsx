import { useMemo, useState } from 'react';
import { BookCover, Button, DataState, Modal, Pill, useToast } from '@/components/ui';
import { useActiveChild } from '@/hooks/useActiveChild';
import { useBooks, useCurrentReads } from '@/hooks/queries';
import { useAddCurrentRead } from '@/hooks/mutations';
import type { ReadingLevel } from '@/types/db';
import { cn } from '@/lib/format';

const levels: ('All' | ReadingLevel)[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

/** "More" dialog: browse the library and add books to Current Reads. */
export function LibraryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { childId } = useActiveChild();
  const books = useBooks();
  const reads = useCurrentReads(childId);
  const add = useAddCurrentRead();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<'All' | ReadingLevel>('All');

  const mine = useMemo(() => new Set(reads.data?.map((b) => b.id)), [reads.data]);
  const shown = useMemo(() => (books.data ?? []).filter((b) =>
    (level === 'All' || b.level === level) &&
    (b.title + b.author).toLowerCase().includes(query.toLowerCase())), [books.data, level, query]);

  return (
    <Modal open={open} onClose={onClose} title="Find a book" size="lg">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title or author"
          aria-label="Search books" className="h-11 min-w-[220px] flex-1 rounded-xl border border-navy/40 bg-white px-4 font-serif"
        />
        <div className="flex gap-2" role="group" aria-label="Reading level">
          {levels.map((l) => (
            <button key={l} type="button" aria-pressed={l === level} onClick={() => setLevel(l)}
              className={cn('rounded-pill px-4 py-2 text-sm font-semibold', l === level ? 'bg-navy text-cream' : 'bg-blue text-navy')}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <DataState isLoading={books.isLoading} error={books.error} isEmpty={shown.length === 0} emptyMessage="No books match your search.">
        <ul className="grid grid-cols-3 gap-5 sm:grid-cols-4">
          {shown.map((b) => (
            <li key={b.id} className="flex flex-col items-center gap-2 text-center">
              <BookCover book={b} size="md" />
              <Pill tone="cream" className="px-3 py-0.5 text-xs">{b.level}</Pill>
              {mine.has(b.id) ? (
                <span className="text-sm font-semibold text-ok">In your reads</span>
              ) : (
                <Button size="sm" loading={add.isPending && add.variables?.bookId === b.id}
                  onClick={() => childId && add.mutate({ childId, bookId: b.id }, { onSuccess: () => toast.success(`Added “${b.title}”`) })}>
                  Add
                </Button>
              )}
            </li>
          ))}
        </ul>
      </DataState>
    </Modal>
  );
}
