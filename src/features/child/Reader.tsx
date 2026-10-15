import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Home, Lock, Pause, Play, Settings, X } from 'lucide-react';
import { Button, ConfirmDialog, Modal, Pill, ProgressBar, WindowFrame, useToast } from '@/components/ui';
import { useActiveChild } from '@/hooks/useActiveChild';
import { useBooks, usePreferences } from '@/hooks/queries';
import { useSavePreferences, useStartSession } from '@/hooks/mutations';
import { SAMPLE_TEXT } from '@/data/readerText';
import { paginate, type Column } from '@/lib/paginate';
import { cn } from '@/lib/format';
import { LockdownGate } from './LockdownOverlay';
import { SessionSummaryModal } from './SessionSummaryModal';
import { useReadingSession } from './useReadingSession';
import type { Preferences } from '@/types/db';

const fontClass: Record<Preferences['font_scale'], string> = {
  md: 'text-[18px] leading-[30px]', lg: 'text-[21px] leading-[34px]', xl: 'text-[24px] leading-[38px]',
};
const themeClass: Record<Preferences['reader_theme'], string> = {
  light: 'bg-white text-navy', sepia: 'bg-[#F4ECD8] text-[#3B2F1E]', dark: 'bg-[#1D2733] text-[#E8E2D0]',
};

function ColumnText({ col, className }: { col: Column; className: string }) {
  return (
    <div className={cn('h-full overflow-y-auto px-5 py-4 font-serif scroll-soft', className)}>
      {col.map((p, i) => (
        <p key={i} className={cn('mb-2 text-justify', !p.cont && 'indent-8')}>{p.text}</p>
      ))}
    </div>
  );
}

const mmss = (seconds: number): string => {
  const s = Math.floor(seconds);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

/** Reader (slide: child reader). Real verified-reading clock, idle prompt, pause, end session. */
export function Reader() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { childId } = useActiveChild();
  const books = useBooks();
  const prefs = usePreferences();
  const savePrefs = useSavePreferences();
  const startM = useStartSession();
  const book = books.data?.find((b) => b.id === bookId);
  const totalPages = book?.total_pages ?? 12;
  const pages = useMemo(() => paginate(SAMPLE_TEXT, totalPages), [totalPages]);
  const s = useReadingSession(childId, bookId, totalPages);

  const [confirmEnd, setConfirmEnd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const p = prefs.data;

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (s.page === null || s.summary || s.idle) return;
      if (e.key === 'ArrowRight') s.setPage(s.page + 1);
      if (e.key === 'ArrowLeft') s.setPage(s.page - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [s]);

  const goHome = (): void => (s.sessionId ? setConfirmEnd(true) : navigate('/child'));
  const spread = pages[(s.page ?? 1) - 1];

  const noSession = !s.isLoading && !s.sessionId && !s.summary;

  return (
    <WindowFrame tone="cream" onClose={() => navigate('/')}>
      <div className="flex h-full flex-col px-10 pb-6 pt-5">
        {/* top bar */}
        <div className="relative flex h-12 items-center justify-between pr-32">
          <div className="flex items-center gap-3">
            <button type="button" onClick={goHome} aria-label="Home" className="rounded-lg p-2 hover:bg-navy-faint"><Home className="h-7 w-7 text-navy" fill="currentColor" /></button>
            <button type="button" onClick={() => setShowSettings((v) => !v)} aria-label="Reading settings" aria-expanded={showSettings} className="rounded-lg p-2 hover:bg-navy-faint"><Settings className="h-7 w-7 text-navy" /></button>
          </div>
          <Pill className="absolute left-1/2 -translate-x-1/2 px-8 py-2 text-lg">{book ? `${book.title} – ${book.author}` : 'Loading…'}</Pill>
          <div className="flex items-center gap-2">
            <Pill tone="cream" className="tabular-nums" aria-label="Verified reading time"><Lock className="h-4 w-4" aria-hidden />{mmss(s.scaledSeconds)}</Pill>
            <Button size="sm" variant="primary" onClick={s.togglePause} disabled={!s.sessionId} icon={s.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}>
              {s.paused ? 'Resume' : 'Pause'}
            </Button>
          </div>
          {showSettings && p && (
            <div className="absolute left-0 top-14 z-20 w-72 rounded-2xl bg-blue p-4 shadow-window" role="group" aria-label="Reading settings">
              <div className="mb-2 text-sm font-semibold">Text size</div>
              <div className="mb-3 flex gap-2">
                {(['md', 'lg', 'xl'] as const).map((f, i) => (
                  <button key={f} type="button" aria-pressed={p.font_scale === f} onClick={() => savePrefs.mutate({ font_scale: f })}
                    className={cn('flex-1 rounded-xl py-2 font-semibold', p.font_scale === f ? 'bg-navy text-cream' : 'bg-cream')} style={{ fontSize: 14 + i * 4 }}>A</button>
                ))}
              </div>
              <div className="mb-2 text-sm font-semibold">Page colour</div>
              <div className="flex gap-2">
                {(['light', 'sepia', 'dark'] as const).map((t) => (
                  <button key={t} type="button" aria-pressed={p.reader_theme === t} onClick={() => savePrefs.mutate({ reader_theme: t })}
                    className={cn('flex-1 rounded-xl border-2 py-2 text-sm font-semibold capitalize', themeClass[t], p.reader_theme === t ? 'border-accent' : 'border-transparent')}>{t}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* pages */}
        <div className="relative mt-5 h-[390px]">
          {spread && p ? (
            <div className={cn('grid h-full grid-cols-2 gap-8 rounded-xl', themeClass[p.reader_theme], fontClass[p.font_scale])} aria-live="off">
              <ColumnText col={spread[0]} className="" />
              <ColumnText col={spread[1]} className="" />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-navy-soft">Opening your book…</div>
          )}
          {s.paused && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl bg-cream/90" role="status">
              <Pause className="h-12 w-12" aria-hidden />
              <p className="text-2xl font-semibold">Paused</p>
              <Button size="lg" onClick={s.togglePause} icon={<Play className="h-5 w-5" />}>Resume reading</Button>
            </div>
          )}
          {noSession && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl bg-cream/95 text-center" role="status">
              <p className="text-xl font-semibold">No reading session is running</p>
              <p className="font-serif text-navy-soft">Start one so your reading time counts towards play time.</p>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => navigate('/child')}>Home</Button>
                <Button loading={startM.isPending} disabled={!childId || !bookId}
                  onClick={() => childId && bookId && startM.mutate({ childId, bookId }, { onError: (e) => toast.error(e.message) })}>Start session</Button>
              </div>
            </div>
          )}
        </div>

        {/* controls */}
        <div className="mt-3 flex items-center gap-4">
          <button type="button" onClick={() => s.page && s.setPage(s.page - 1)} disabled={!s.page || s.page <= 1}
            className="flex w-24 shrink-0 flex-col items-center disabled:opacity-30" aria-label="Previous page">
            <ArrowLeft className="h-9 w-16" strokeWidth={3} /><span className="text-lg">Previous</span>
          </button>
          <ProgressBar value={s.page ?? 1} min={1} max={totalPages} onChange={s.setPage} label="Page progress" className="flex-1" />
          <button type="button" onClick={() => s.page && s.setPage(s.page + 1)} disabled={!s.page || s.page >= totalPages}
            className="flex w-24 shrink-0 flex-col items-center disabled:opacity-30" aria-label="Next page">
            <ArrowRight className="h-9 w-16" strokeWidth={3} /><span className="text-lg">Next</span>
          </button>
        </div>
        <div className="relative mt-1 flex justify-center">
          <Pill className="px-6 text-lg tabular-nums" aria-label={`Page ${s.page ?? 1} of ${totalPages}`}>{s.page ?? 1}/{totalPages}</Pill>
          <Button size="sm" variant="ghost" className="absolute right-0 top-0" icon={<X className="h-4 w-4" />} onClick={() => setConfirmEnd(true)} disabled={!s.sessionId}>End session</Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmEnd} title="End your reading session?" confirmLabel="End session" loading={s.ending}
        message={`You have read for ${s.verifiedMinutes} minute${s.verifiedMinutes === 1 ? '' : 's'}. Ending now adds your play time to your balance.`}
        onCancel={() => setConfirmEnd(false)} onConfirm={() => { setConfirmEnd(false); void s.end(); }}
      />
      <Modal open={s.idle} onClose={s.confirmStillReading} dismissible={false} title="Still reading?" size="sm"
        footer={<Button size="lg" onClick={s.confirmStillReading} autoFocus>Yes, I’m reading</Button>}>
        <p className="font-serif text-lg">Your timer is paused until you tap the button, so only real reading counts.</p>
      </Modal>
      <SessionSummaryModal session={s.summary} onDone={() => { s.clearSummary(); navigate('/child'); }} />
      <LockdownGate />
    </WindowFrame>
  );
}
