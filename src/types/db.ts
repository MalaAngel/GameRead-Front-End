/**
 * Types mirroring the planned Supabase tables (snake_case, uuid string ids, ISO timestamps).
 * When the backend is added, run `supabase gen types typescript` and make these match.
 */
export type Role = 'parent' | 'child';
export type ISODate = string;

export interface Profile {
  id: string;
  role: Role;
  email: string;
  username: string;
  display_name: string;
  /** Only set for child accounts. */
  child_id: string | null;
}

export type AgeBand = '4-6' | '7-9' | '10-12' | '13-17';
export type ReadingLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type DeviceStatus = 'idle' | 'reading' | 'locked' | 'playing' | 'offline';

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  age_band: AgeBand;
  reading_level: ReadingLevel;
  family_code: string;
  device_name: string | null;
  last_active: ISODate | null;
}

export type CoverMotif = 'hat' | 'notebook' | 'planet' | 'plain';
export interface Book {
  id: string;
  title: string;
  author: string;
  total_pages: number;
  level: ReadingLevel;
  /** Generated cover art (no copyrighted images are bundled). */
  cover_color: string;
  cover_accent: string;
  cover_motif: CoverMotif;
}

export type AssignmentStatus = 'not_started' | 'in_progress' | 'done';
export interface Assignment {
  id: string;
  child_id: string;
  book_id: string;
  due_date: ISODate;
  target_minutes: number;
  progress_pct: number;
  status: AssignmentStatus;
}

export interface CurrentRead {
  child_id: string;
  book_id: string;
}

export interface BookProgress {
  child_id: string;
  book_id: string;
  current_page: number;
}

export type SessionState = 'active' | 'paused' | 'ended';
export interface ReadingSession {
  id: string;
  child_id: string;
  book_id: string;
  started_at: ISODate;
  ended_at: ISODate | null;
  state: SessionState;
  ended_by: 'child' | 'parent' | null;
  verified_minutes: number;
  pages_read: number;
  bonus_minutes: number;
}

export type RuleKind = 'allow' | 'block';
export interface Rule {
  id: string;
  child_id: string;
  kind: RuleKind;
  /** Executable name, e.g. "Roblox.exe". */
  exe_name: string;
  /** Optional full path. */
  path: string | null;
}

export interface RewardSettings {
  child_id: string;
  /** Play minutes earned per verified reading minute. */
  ratio: number;
  daily_cap_minutes: number;
}

export type ScheduleKind = 'reading' | 'lockdown';
export interface ScheduleBlock {
  id: string;
  child_id: string;
  /** 0 = Monday ... 6 = Sunday */
  day: number;
  hour: number;
  kind: ScheduleKind;
}

export type AlertType = 'terminate_attempt' | 'file_modified' | 'clock_changed' | 'blocked_app';
export type AlertSeverity = 'low' | 'medium' | 'high';
export interface Alert {
  id: string;
  child_id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  created_at: ISODate;
  acknowledged: boolean;
}

export interface LedgerEntry {
  id: string;
  child_id: string;
  kind: 'earned' | 'spent';
  minutes: number;
  session_id: string | null;
  note: string;
  created_at: ISODate;
}

/** Live device state (a Supabase Realtime row/channel in the real backend). */
export interface LiveState {
  child_id: string;
  status: DeviceStatus;
  session_id: string | null;
  paused: boolean;
  lockdown: {
    active: boolean;
    variant: 'blocked_app' | 'task_switch' | 'override' | null;
    app_name: string | null;
  };
  updated_at: ISODate;
}

export interface Preferences {
  font_scale: 'md' | 'lg' | 'xl';
  reader_theme: 'light' | 'sepia' | 'dark';
  notify_alerts: boolean;
  notify_weekly_report: boolean;
  report_frequency: 'daily' | 'weekly';
}

/* ------------ Derived / view types returned by the API ------------ */
export interface Wallet {
  total_read_minutes: number;
  total_earned_minutes: number;
  spent_minutes: number;
  balance_minutes: number;
  today_earned_minutes: number;
  daily_cap_minutes: number;
  cap_remaining_minutes: number;
}

export interface Stats {
  monthly_pages: { month: string; pages: number }[];
  daily_minutes: { day: string; minutes: number }[];
  weekly_minutes: number;
  weekly_pages: number;
}
