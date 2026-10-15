import type { Book } from '@/types/db';
import { cn } from '@/lib/format';

/** Picks a readable text colour for a hex background. */
function inkFor(hex: string): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.62 ? '#0B4470' : '#FFFBEA';
}

const sizes = { sm: 'w-20', md: 'w-32', lg: 'w-40' } as const;

/**
 * Generated cover art: coloured block + simple motif + title. No copyrighted artwork is used.
 */
export function BookCover({
  book, size = 'md', onClick, selected, className,
}: {
  book: Pick<Book, 'title' | 'author' | 'cover_color' | 'cover_accent' | 'cover_motif'>;
  size?: keyof typeof sizes;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}) {
  const tiny = size === 'sm';
  const body = (
    <div
      className={cn(
        'relative flex aspect-[2/3] flex-col overflow-hidden rounded-md text-center shadow-soft',
        sizes[size], selected && 'ring-4 ring-accent', className,
      )}
      style={{ background: book.cover_color }}
      role="img"
      aria-label={`${book.title} by ${book.author}`}
    >
      {book.cover_motif === 'hat' && (
        <div className="absolute inset-x-0 top-[34%] mx-auto h-[34%] w-[64%]" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[25%]" style={{ background: i % 2 ? '#FFFBEA' : book.cover_accent }} />
          ))}
        </div>
      )}
      {book.cover_motif === 'notebook' && (
        <div className="absolute inset-x-[12%] top-[38%] h-[40%] rounded-sm bg-cream/95" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="mx-2 mt-[14%] h-px bg-blue-deep" />
          ))}
        </div>
      )}
      {book.cover_motif === 'planet' && (
        <>
          <div className="absolute left-[14%] top-[36%] h-[7%] w-[7%] rounded-full" style={{ background: book.cover_accent }} aria-hidden />
          <div className="absolute inset-x-[-10%] bottom-[-18%] h-[44%] rounded-full bg-[#C9B8A4]" aria-hidden />
        </>
      )}
      {book.cover_motif === 'plain' && (
        <div className="absolute inset-x-[16%] top-[44%] h-[2px]" style={{ background: book.cover_accent }} aria-hidden />
      )}
      <div
        className={cn('relative z-10 px-2 pt-[12%] font-serif font-bold leading-tight', tiny ? 'text-[9px]' : 'text-sm')}
        style={{ color: inkFor(book.cover_color) }}
      >
        {book.title}
      </div>
      <div
        className={cn('relative z-10 mt-auto pb-[6%] font-sans font-medium', tiny ? 'text-[7px]' : 'text-[10px]')}
        style={{ color: inkFor(book.cover_color) }}
      >
        {book.author}
      </div>
    </div>
  );
  if (!onClick) return body;
  return (
    <button type="button" onClick={onClick} className="rounded-md transition-transform hover:-translate-y-1" aria-pressed={selected}>
      {body}
    </button>
  );
}
