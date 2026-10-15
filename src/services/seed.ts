import type {
  Alert, Assignment, Book, BookProgress, Child, CurrentRead, LedgerEntry, LiveState, Preferences,
  ReadingSession, RewardSettings, Rule, ScheduleBlock,
} from '@/types/db';
import { DEFAULT_DAILY_CAP_MINUTES, DEFAULT_RATIO } from '@/lib/reward';

export interface StoredUser {
  id: string;
  role: 'parent' | 'child';
  email: string;
  username: string;
  password: string;
  display_name: string;
  child_id: string | null;
}

export interface MockDB {
  users: StoredUser[];
  children: Child[];
  books: Book[];
  current_reads: CurrentRead[];
  book_progress: BookProgress[];
  assignments: Assignment[];
  sessions: ReadingSession[];
  rules: Rule[];
  reward_settings: RewardSettings[];
  schedule_blocks: ScheduleBlock[];
  alerts: Alert[];
  ledger: LedgerEntry[];
  live: LiveState[];
  preferences: Preferences;
  auth_user_id: string | null;
}

export const PARENT_ID = 'parent-1';
export const CHILD_ID = 'child-1';

const at = (daysAgo: number, hour = 17, minute = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};
const inDays = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(18, 0, 0, 0);
  return d.toISOString();
};

/** Book covers are generated in CSS; titles from the design slides, all other metadata is invented. */
const books: Book[] = [
  { id: 'b-cat', title: 'The Cat in the Hat', author: 'Dr. Seuss', total_pages: 12, level: 'Beginner', cover_color: '#1F8FA8', cover_accent: '#D7263D', cover_motif: 'hat' },
  { id: 'b-wimpy', title: 'Diary of a Wimpy Kid', author: 'Jeff Kinney', total_pages: 12, level: 'Intermediate', cover_color: '#E86FB3', cover_accent: '#F7D046', cover_motif: 'notebook' },
  { id: 'b-prince', title: 'The Little Prince', author: 'Antoine de Saint-Exupéry', total_pages: 12, level: 'Intermediate', cover_color: '#2347A8', cover_accent: '#F7D046', cover_motif: 'planet' },
  { id: 'b-alice', title: "Alice's Adventures in Wonderland", author: 'Lewis Carroll', total_pages: 12, level: 'Intermediate', cover_color: '#5B8E7D', cover_accent: '#F4E285', cover_motif: 'plain' },
  { id: 'b-willows', title: 'The Wind in the Willows', author: 'Kenneth Grahame', total_pages: 12, level: 'Intermediate', cover_color: '#7A9E3B', cover_accent: '#FFFBEA', cover_motif: 'plain' },
  { id: 'b-peter', title: 'Peter Pan', author: 'J. M. Barrie', total_pages: 12, level: 'Advanced', cover_color: '#3B3B7A', cover_accent: '#F7D046', cover_motif: 'planet' },
  { id: 'b-jungle', title: 'The Jungle Book', author: 'Rudyard Kipling', total_pages: 12, level: 'Advanced', cover_color: '#B5651D', cover_accent: '#FFFBEA', cover_motif: 'plain' },
  { id: 'b-beauty', title: 'Black Beauty', author: 'Anna Sewell', total_pages: 12, level: 'Advanced', cover_color: '#4A3F3F', cover_accent: '#EDB4E8', cover_motif: 'notebook' },
];

// 7 sessions: verified minutes sum to 643 (10h43m) and bonus minutes sum to 195 (3h15m), matching the design slides.
const sessionRows: { daysAgo: number; book: string; minutes: number; pages: number; bonus: number }[] = [
  { daysAgo: 6, book: 'b-cat', minutes: 95, pages: 18, bonus: 28 },
  { daysAgo: 5, book: 'b-wimpy', minutes: 80, pages: 14, bonus: 24 },
  { daysAgo: 4, book: 'b-prince', minutes: 110, pages: 16, bonus: 33 },
  { daysAgo: 3, book: 'b-cat', minutes: 70, pages: 12, bonus: 21 },
  { daysAgo: 2, book: 'b-wimpy', minutes: 90, pages: 15, bonus: 27 },
  { daysAgo: 1, book: 'b-prince', minutes: 100, pages: 17, bonus: 30 },
  { daysAgo: 0, book: 'b-cat', minutes: 98, pages: 16, bonus: 32 },
];

export function buildSeed(): MockDB {
  const sessions: ReadingSession[] = sessionRows.map((s, i) => ({
    id: `s-${i + 1}`,
    child_id: CHILD_ID,
    book_id: s.book,
    started_at: at(s.daysAgo, 16, 0),
    ended_at: at(s.daysAgo, 17, 40),
    state: 'ended',
    ended_by: 'child',
    verified_minutes: s.minutes,
    pages_read: s.pages,
    bonus_minutes: s.bonus,
  }));

  const earned: LedgerEntry[] = sessionRows.map((s, i) => ({
    id: `l-e${i + 1}`,
    child_id: CHILD_ID,
    kind: 'earned',
    minutes: s.bonus,
    session_id: `s-${i + 1}`,
    note: `Reading session (${s.minutes} min)`,
    created_at: at(s.daysAgo, 17, 40),
  }));
  const spent: LedgerEntry[] = [
    { id: 'l-s1', child_id: CHILD_ID, kind: 'spent', minutes: 45, session_id: null, note: 'Play time', created_at: at(5, 19) },
    { id: 'l-s2', child_id: CHILD_ID, kind: 'spent', minutes: 40, session_id: null, note: 'Play time', created_at: at(3, 19) },
    { id: 'l-s3', child_id: CHILD_ID, kind: 'spent', minutes: 60, session_id: null, note: 'Play time', created_at: at(1, 19) },
  ];

  const schedule: ScheduleBlock[] = [];
  for (let day = 0; day < 5; day++) {
    schedule.push({ id: `sb-r${day}-16`, child_id: CHILD_ID, day, hour: 16, kind: 'reading' });
    schedule.push({ id: `sb-r${day}-17`, child_id: CHILD_ID, day, hour: 17, kind: 'reading' });
    schedule.push({ id: `sb-l${day}-18`, child_id: CHILD_ID, day, hour: 18, kind: 'lockdown' });
  }

  return {
    users: [
      { id: PARENT_ID, role: 'parent', email: 'demo.parent@gameread.app', username: 'demo-parent', password: 'demo1234', display_name: 'Demo Parent', child_id: null },
      { id: 'user-child-1', role: 'child', email: '', username: 'victoria', password: '', display_name: 'Victoria', child_id: CHILD_ID },
    ],
    children: [
      { id: CHILD_ID, parent_id: PARENT_ID, name: 'Victoria', age_band: '7-9', reading_level: 'Intermediate', family_code: '123456', device_name: "Victoria's laptop", last_active: at(0, 17, 40) },
    ],
    books,
    current_reads: [
      { child_id: CHILD_ID, book_id: 'b-cat' },
      { child_id: CHILD_ID, book_id: 'b-wimpy' },
      { child_id: CHILD_ID, book_id: 'b-prince' },
    ],
    book_progress: [
      { child_id: CHILD_ID, book_id: 'b-cat', current_page: 10 },
      { child_id: CHILD_ID, book_id: 'b-wimpy', current_page: 4 },
      { child_id: CHILD_ID, book_id: 'b-prince', current_page: 7 },
    ],
    assignments: [
      { id: 'a-1', child_id: CHILD_ID, book_id: 'b-cat', due_date: inDays(2), target_minutes: 120, progress_pct: 60, status: 'in_progress' },
      { id: 'a-2', child_id: CHILD_ID, book_id: 'b-wimpy', due_date: inDays(5), target_minutes: 180, progress_pct: 0, status: 'not_started' },
      { id: 'a-3', child_id: CHILD_ID, book_id: 'b-prince', due_date: inDays(9), target_minutes: 240, progress_pct: 35, status: 'in_progress' },
    ],
    sessions,
    rules: [
      { id: 'r-1', child_id: CHILD_ID, kind: 'block', exe_name: 'RobloxPlayerBeta.exe', path: null },
      { id: 'r-2', child_id: CHILD_ID, kind: 'block', exe_name: 'Minecraft.exe', path: null },
      { id: 'r-3', child_id: CHILD_ID, kind: 'block', exe_name: 'FortniteClient-Win64-Shipping.exe', path: null },
      { id: 'r-4', child_id: CHILD_ID, kind: 'block', exe_name: 'Steam.exe', path: 'C:\\Program Files (x86)\\Steam\\Steam.exe' },
      { id: 'r-5', child_id: CHILD_ID, kind: 'allow', exe_name: 'GameRead.exe', path: null },
      { id: 'r-6', child_id: CHILD_ID, kind: 'allow', exe_name: 'notepad.exe', path: null },
    ],
    reward_settings: [{ child_id: CHILD_ID, ratio: DEFAULT_RATIO, daily_cap_minutes: DEFAULT_DAILY_CAP_MINUTES }],
    schedule_blocks: schedule,
    alerts: [
      { id: 'al-1', child_id: CHILD_ID, type: 'terminate_attempt', severity: 'high', message: 'Attempt to end the GameRead process from Task Manager.', created_at: at(2, 18, 12), acknowledged: false },
      { id: 'al-2', child_id: CHILD_ID, type: 'clock_changed', severity: 'medium', message: 'System clock moved back 45 minutes.', created_at: at(1, 16, 30), acknowledged: false },
      { id: 'al-3', child_id: CHILD_ID, type: 'blocked_app', severity: 'low', message: 'Minecraft.exe was launched during a reading session and was closed.', created_at: at(1, 17, 5), acknowledged: true },
      { id: 'al-4', child_id: CHILD_ID, type: 'file_modified', severity: 'high', message: 'A GameRead program file was modified.', created_at: at(4, 15, 48), acknowledged: true },
    ],
    ledger: [...earned, ...spent],
    live: [{
      child_id: CHILD_ID, status: 'idle', session_id: null, paused: false,
      lockdown: { active: false, variant: null, app_name: null }, updated_at: at(0, 17, 40),
    }],
    preferences: {
      font_scale: 'md', reader_theme: 'light', notify_alerts: true, notify_weekly_report: true, report_frequency: 'weekly',
    },
    auth_user_id: null,
  };
}
