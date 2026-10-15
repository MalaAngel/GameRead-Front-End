import { useCallback, useEffect, useRef, useState } from 'react';
import { useBookProgress, useLiveState, useSessions } from '@/hooks/queries';
import { useEndSession, usePauseSession, useRecordProgress, useResumeSession } from '@/hooks/mutations';
import { getDemoSpeed } from '@/lib/demo';
import type { ReadingSession } from '@/types/db';

export const IDLE_MS = 60_000;

/**
 * Drives the reader: verified reading time (stops when paused, idle, locked or ended),
 * page tracking, periodic progress saves, pause/resume and ending the session.
 */
export function useReadingSession(childId: string | undefined, bookId: string | undefined, totalPages: number) {
  const live = useLiveState(childId);
  const sessions = useSessions(childId);
  const progress = useBookProgress(childId, bookId);
  const record = useRecordProgress();
  const pauseM = usePauseSession();
  const resumeM = useResumeSession();
  const endM = useEndSession();

  const [page, setPageState] = useState<number | null>(null);
  const [scaledSeconds, setScaledSeconds] = useState(0);
  const [idle, setIdle] = useState(false);
  const [summary, setSummary] = useState<ReadingSession | null>(null);

  const visited = useRef(new Set<number>());
  const lastActivity = useRef(Date.now());
  const seeded = useRef<string | null>(null);
  const heldId = useRef<string | null>(null);
  const latest = useRef({ seconds: 0, page: 1 });

  const sessionId = live.data?.session_id ?? null;
  const paused = !!live.data?.paused;
  const lockdown = !!live.data?.lockdown.active;
  const session = sessions.data?.find((s) => s.id === sessionId);

  // starting page
  useEffect(() => {
    if (page === null && progress.data) {
      const start = Math.min(Math.max(1, progress.data.current_page), totalPages);
      setPageState(start);
      visited.current.add(start);
    }
  }, [progress.data, page, totalPages]);

  // resume the clock from the stored session minutes
  useEffect(() => {
    if (session && seeded.current !== session.id) {
      seeded.current = session.id;
      const s = session.verified_minutes * 60;
      setScaledSeconds(s);
      latest.current.seconds = s;
    }
  }, [session]);

  useEffect(() => { if (sessionId) heldId.current = sessionId; }, [sessionId]);

  // activity tracking for the idle prompt
  useEffect(() => {
    const mark = (): void => { lastActivity.current = Date.now(); };
    const events = ['pointermove', 'pointerdown', 'keydown'] as const;
    events.forEach((e) => window.addEventListener(e, mark));
    return () => events.forEach((e) => window.removeEventListener(e, mark));
  }, []);

  // the verified-time clock
  const running = !!sessionId && !paused && !lockdown && !idle && !summary;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (Date.now() - lastActivity.current > IDLE_MS) { setIdle(true); return; }
      setScaledSeconds((s) => { const n = s + getDemoSpeed(); latest.current.seconds = n; return n; });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const verifiedMinutes = Math.floor(scaledSeconds / 60);

  const save = useCallback(() => {
    if (!sessionId) return Promise.resolve();
    return record.mutateAsync({
      sessionId,
      verified_minutes: Math.floor(latest.current.seconds / 60),
      pages_read: visited.current.size,
      current_page: latest.current.page,
    });
  }, [sessionId, record]);

  // periodic save
  useEffect(() => {
    if (!sessionId) return;
    const id = setInterval(() => { void save(); }, 2000);
    return () => clearInterval(id);
  }, [sessionId, save]);

  const setPage = useCallback((p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    latest.current.page = next;
    visited.current.add(next);
    setPageState(next);
  }, [totalPages]);
  useEffect(() => { if (page !== null) latest.current.page = page; }, [page]);

  const togglePause = useCallback(() => {
    if (!sessionId) return;
    (paused ? resumeM : pauseM).mutate(sessionId);
  }, [sessionId, paused, pauseM, resumeM]);

  const end = useCallback(async () => {
    if (!sessionId) return;
    await save();
    const result = await endM.mutateAsync({ sessionId, endedBy: 'child' });
    setSummary(result);
  }, [sessionId, save, endM]);

  // session ended elsewhere (parent override): show the summary
  useEffect(() => {
    if (summary || !heldId.current || !live.data || live.data.session_id !== null || live.data.lockdown.active) return;
    const ended = sessions.data?.find((s) => s.id === heldId.current && s.state === 'ended');
    if (ended) setSummary(ended);
  }, [live.data, sessions.data, summary]);

  return {
    live: live.data, isLoading: live.isLoading || progress.isLoading, sessionId, paused, lockdown, idle,
    page, setPage, verifiedMinutes, scaledSeconds, pagesRead: visited.current.size,
    confirmStillReading: () => { lastActivity.current = Date.now(); setIdle(false); },
    togglePause, end, ending: endM.isPending, summary, clearSummary: () => setSummary(null),
  };
}
