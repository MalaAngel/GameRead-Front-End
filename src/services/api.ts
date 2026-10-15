import type {
  Alert, AlertType, AgeBand, Assignment, Book, BookProgress, Child, LedgerEntry, LiveState,
  Preferences, Profile, ReadingLevel, ReadingSession, RewardSettings, Role, Rule, RuleKind,
  ScheduleBlock, Stats, Wallet,
} from '@/types/db';

/**
 * The ONLY surface the UI uses to read/write data.
 * - Today: implemented by mockApi.ts (localStorage + seed data).
 * - Later:  implement the same interface in supabaseApi.ts and change one line in services/index.ts.
 *
 * Mapping hints for Supabase are noted per group.
 */
export interface GameReadApi {
  /** Supabase Auth (email/password + Google/Apple OAuth) and the `profiles` table. */
  auth: {
    signUp(input: { email: string; username: string; password: string; role: Role }): Promise<Profile>;
    signIn(input: { identifier: string; password: string }): Promise<Profile>;
    /** Prototype shortcut so reviewers can enter either role instantly. */
    signInAsDemo(role: Role): Promise<Profile>;
    signInWithProvider(provider: 'google' | 'apple' | 'other'): Promise<Profile>;
    /** Child device pairing: accepts a 6-digit family code. */
    joinWithFamilyCode(code: string): Promise<Profile>;
    signOut(): Promise<void>;
    getCurrentUser(): Promise<Profile | null>;
  };

  /** `children` table. */
  children: {
    list(): Promise<Child[]>;
    get(id: string): Promise<Child>;
    add(input: { name: string; age_band: AgeBand; reading_level: ReadingLevel }): Promise<Child>;
    update(id: string, patch: Partial<Pick<Child, 'name' | 'age_band' | 'reading_level'>>): Promise<Child>;
    remove(id: string): Promise<void>;
  };

  /** `books`, `current_reads`, `book_progress`. */
  books: {
    list(): Promise<Book[]>;
    listCurrentReads(childId: string): Promise<Book[]>;
    addCurrentRead(childId: string, bookId: string): Promise<void>;
    removeCurrentRead(childId: string, bookId: string): Promise<void>;
    getProgress(childId: string, bookId: string): Promise<BookProgress>;
  };

  /** `assignments`. */
  assignments: {
    list(childId?: string): Promise<Assignment[]>;
    create(input: Pick<Assignment, 'child_id' | 'book_id' | 'due_date' | 'target_minutes'>): Promise<Assignment>;
    update(id: string, patch: Partial<Pick<Assignment, 'due_date' | 'target_minutes' | 'book_id'>>): Promise<Assignment>;
    remove(id: string): Promise<void>;
  };

  /** `reading_sessions` + the live device row (Supabase Realtime). Covers F-03 and F-04. */
  sessions: {
    list(childId: string): Promise<ReadingSession[]>;
    getLiveState(childId: string): Promise<LiveState>;
    start(childId: string, bookId: string): Promise<ReadingSession>;
    pause(sessionId: string): Promise<LiveState>;
    resume(sessionId: string): Promise<LiveState>;
    /** Called periodically by the reader with verified (non-idle) reading progress. */
    recordProgress(
      sessionId: string,
      progress: { verified_minutes: number; pages_read: number; current_page: number },
    ): Promise<void>;
    /** Ends the session and computes the bonus (server-side in the real backend, NFR-05). */
    end(sessionId: string, endedBy: 'child' | 'parent'): Promise<ReadingSession>;
    /** Parent override: ends lockdown immediately. */
    parentOverride(childId: string): Promise<LiveState>;
    /** Dismisses the lockdown overlay on the child device. */
    clearLockdown(childId: string): Promise<LiveState>;
    /** DEMO ONLY: stands in for the device agent detecting a blacklisted app. */
    simulateBlockedApp(childId: string, variant?: 'blocked_app' | 'task_switch'): Promise<LiveState>;
  };

  /** `rules` (whitelist / blacklist). */
  rules: {
    list(childId: string): Promise<Rule[]>;
    add(input: { child_id: string; kind: RuleKind; exe_name: string; path?: string | null }): Promise<Rule>;
    update(id: string, patch: Partial<Pick<Rule, 'kind' | 'exe_name' | 'path'>>): Promise<Rule>;
    remove(id: string): Promise<void>;
  };

  /** `reward_settings` (ratio + cap). */
  rewards: {
    get(childId: string): Promise<RewardSettings>;
    save(settings: RewardSettings): Promise<RewardSettings>;
  };

  /** `schedule_blocks`. */
  schedule: {
    get(childId: string): Promise<ScheduleBlock[]>;
    save(childId: string, blocks: Omit<ScheduleBlock, 'id' | 'child_id'>[]): Promise<ScheduleBlock[]>;
  };

  /** `alerts` (tamper log, F-05). */
  alerts: {
    list(childId?: string): Promise<Alert[]>;
    acknowledge(id: string): Promise<void>;
    /** DEMO ONLY: stands in for the device agent reporting a tamper attempt. */
    fire(childId: string, type: AlertType): Promise<Alert>;
  };

  /** `playtime_ledger` + derived wallet (F-07). */
  playtime: {
    ledger(childId: string): Promise<LedgerEntry[]>;
    wallet(childId: string): Promise<Wallet>;
    spend(childId: string, minutes: number, note?: string): Promise<LedgerEntry>;
    /** Spends minutes from the balance and marks the device as "playing". */
    startPlay(childId: string, minutes: number): Promise<LiveState>;
    /** Marks the play period as finished. */
    endPlay(childId: string): Promise<LiveState>;
  };

  /** Aggregates for charts (a SQL view/RPC in the real backend). */
  stats: {
    get(childId: string): Promise<Stats>;
  };

  /** `preferences` table. */
  preferences: {
    get(): Promise<Preferences>;
    save(patch: Partial<Preferences>): Promise<Preferences>;
  };

  /** Realtime hook: called when another tab/device changes data. Returns an unsubscribe function. */
  subscribe(onChange: () => void): () => void;

  /** DEMO ONLY. */
  resetDemo(): Promise<void>;
}
