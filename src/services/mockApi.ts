import type { GameReadApi } from './api';
import { buildSeed, CHILD_ID, type MockDB, type StoredUser } from './seed';
import type {
  Alert, AlertSeverity, AlertType, LiveState, Profile, ReadingSession, Stats, Wallet,
} from '@/types/db';
import { bonusMinutes } from '@/lib/reward';
import { isSameLocalDay } from '@/lib/format';

/**
 * Mock implementation of GameReadApi backed by localStorage.
 * Every call re-reads storage, so two browser tabs (parent + child) stay consistent.
 */
const KEY = 'gameread.db.v1';
const CHANNEL = 'gameread-sync';

const channel: BroadcastChannel | null =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL) : null;

function load(): MockDB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as MockDB;
  } catch {
    /* fall through and reseed */
  }
  const seed = buildSeed();
  localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}

function commit(db: MockDB): void {
  localStorage.setItem(KEY, JSON.stringify(db));
  channel?.postMessage('changed');
}

const wait = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 120 + Math.random() * 120));

/** Runs `fn` against a fresh copy of the DB, simulating network latency. Writes are persisted. */
async function run<T>(fn: (db: MockDB) => T, write = false): Promise<T> {
  await wait();
  const db = load();
  const result = fn(db);
  if (write) commit(db);
  return result;
}

const uid = (prefix: string): string => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
const nowIso = (): string => new Date().toISOString();

function toProfile(u: StoredUser): Profile {
  return {
    id: u.id, role: u.role, email: u.email, username: u.username,
    display_name: u.display_name, child_id: u.child_id,
  };
}

function need<T>(value: T | undefined | null, message: string): T {
  if (value === undefined || value === null) throw new Error(message);
  return value;
}

function getLive(db: MockDB, childId: string): LiveState {
  let live = db.live.find((l) => l.child_id === childId);
  if (!live) {
    live = {
      child_id: childId, status: 'idle', session_id: null, paused: false,
      lockdown: { active: false, variant: null, app_name: null }, updated_at: nowIso(),
    };
    db.live.push(live);
  }
  return live;
}

function computeWallet(db: MockDB, childId: string): Wallet {
  const settings = db.reward_settings.find((r) => r.child_id === childId);
  const cap = settings?.daily_cap_minutes ?? 0;
  const entries = db.ledger.filter((l) => l.child_id === childId);
  const earned = entries.filter((l) => l.kind === 'earned');
  const spent = entries.filter((l) => l.kind === 'spent').reduce((s, l) => s + l.minutes, 0);
  const totalEarned = earned.reduce((s, l) => s + l.minutes, 0);
  const today = new Date();
  const todayEarned = earned
    .filter((l) => isSameLocalDay(l.created_at, today))
    .reduce((s, l) => s + l.minutes, 0);
  const totalRead = db.sessions
    .filter((s) => s.child_id === childId)
    .reduce((sum, s) => sum + s.verified_minutes, 0);
  return {
    total_read_minutes: totalRead,
    total_earned_minutes: totalEarned,
    spent_minutes: spent,
    balance_minutes: Math.max(0, totalEarned - spent),
    today_earned_minutes: todayEarned,
    daily_cap_minutes: cap,
    cap_remaining_minutes: Math.max(0, cap - todayEarned),
  };
}

function pushAlert(db: MockDB, childId: string, type: AlertType, severity: AlertSeverity, message: string): Alert {
  const alert: Alert = {
    id: uid('al'), child_id: childId, type, severity, message, created_at: nowIso(), acknowledged: false,
  };
  db.alerts.unshift(alert);
  return alert;
}

function endSessionInDb(db: MockDB, sessionId: string, endedBy: 'child' | 'parent'): ReadingSession {
  const session = need(db.sessions.find((s) => s.id === sessionId), 'Session not found');
  if (session.state === 'ended') return session;

  const wallet = computeWallet(db, session.child_id);
  const settings = need(db.reward_settings.find((r) => r.child_id === session.child_id), 'No reward settings');
  const bonus = bonusMinutes(session.verified_minutes, settings.ratio, wallet.cap_remaining_minutes);

  session.state = 'ended';
  session.ended_by = endedBy;
  session.ended_at = nowIso();
  session.bonus_minutes = bonus;

  if (bonus > 0) {
    db.ledger.push({
      id: uid('l'), child_id: session.child_id, kind: 'earned', minutes: bonus, session_id: session.id,
      note: `Reading session (${session.verified_minutes} min)`, created_at: nowIso(),
    });
  }

  const book = db.books.find((b) => b.id === session.book_id);
  const assignment = db.assignments.find((a) => a.child_id === session.child_id && a.book_id === session.book_id);
  if (assignment && book) {
    const gain = (session.pages_read / book.total_pages) * 100;
    assignment.progress_pct = Math.min(100, Math.round(assignment.progress_pct + gain));
    assignment.status = assignment.progress_pct >= 100 ? 'done' : 'in_progress';
  }

  const live = getLive(db, session.child_id);
  live.status = 'idle';
  live.session_id = null;
  live.paused = false;
  live.updated_at = nowIso();

  const child = db.children.find((c) => c.id === session.child_id);
  if (child) child.last_active = nowIso();
  return session;
}

export const mockApi: GameReadApi = {
  auth: {
    async signUp({ email, username, password, role }) {
      return run((db) => {
        if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase() && email))
          throw new Error('An account with this email already exists.');
        if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase()))
          throw new Error('That username is taken.');
        const user: StoredUser = {
          id: uid('user'), role, email, username, password, display_name: username, child_id: null,
        };
        db.users.push(user);
        db.auth_user_id = user.id;
        return toProfile(user);
      }, true);
    },
    async signIn({ identifier, password }) {
      return run((db) => {
        const id = identifier.toLowerCase();
        const user = db.users.find(
          (u) => (u.email.toLowerCase() === id || u.username.toLowerCase() === id) && u.password === password,
        );
        if (!user) throw new Error('Incorrect username or password.');
        db.auth_user_id = user.id;
        return toProfile(user);
      }, true);
    },
    async signInAsDemo(role) {
      return run((db) => {
        const user = need(db.users.find((u) => u.role === role), 'No demo user');
        db.auth_user_id = user.id;
        return toProfile(user);
      }, true);
    },
    async signInWithProvider(provider) {
      return run((db) => {
        // The mock treats social sign-in as signing in to the demo parent account.
        const user = need(db.users.find((u) => u.role === 'parent'), 'No demo user');
        db.auth_user_id = user.id;
        void provider;
        return toProfile(user);
      }, true);
    },
    async joinWithFamilyCode(code) {
      return run((db) => {
        if (!/^\d{6}$/.test(code)) throw new Error('Enter the 6-digit family code.');
        const child = db.children.find((c) => c.family_code === code) ?? db.children[0];
        const user = need(db.users.find((u) => u.role === 'child' && u.child_id === child.id), 'No child account');
        db.auth_user_id = user.id;
        return toProfile(user);
      }, true);
    },
    async signOut() {
      return run((db) => { db.auth_user_id = null; }, true);
    },
    async getCurrentUser() {
      return run((db) => {
        const user = db.users.find((u) => u.id === db.auth_user_id);
        return user ? toProfile(user) : null;
      });
    },
  },

  children: {
    list: () => run((db) => db.children),
    get: (id) => run((db) => need(db.children.find((c) => c.id === id), 'Child not found')),
    add: (input) => run((db) => {
      const parentId = db.auth_user_id ?? db.users[0].id;
      const child = {
        id: uid('child'), parent_id: parentId, ...input,
        family_code: String(Math.floor(100000 + Math.random() * 900000)),
        device_name: null, last_active: null,
      };
      db.children.push(child);
      db.users.push({
        id: uid('user'), role: 'child', email: '', username: input.name.toLowerCase(), password: '',
        display_name: input.name, child_id: child.id,
      });
      db.reward_settings.push({ child_id: child.id, ratio: 0.3, daily_cap_minutes: 120 });
      return child;
    }, true),
    update: (id, patch) => run((db) => {
      const child = need(db.children.find((c) => c.id === id), 'Child not found');
      Object.assign(child, patch);
      return child;
    }, true),
    remove: (id) => run((db) => {
      db.children = db.children.filter((c) => c.id !== id);
      db.users = db.users.filter((u) => u.child_id !== id);
    }, true),
  },

  books: {
    list: () => run((db) => db.books),
    listCurrentReads: (childId) => run((db) =>
      db.current_reads
        .filter((c) => c.child_id === childId)
        .map((c) => need(db.books.find((b) => b.id === c.book_id), 'Book not found')),
    ),
    addCurrentRead: (childId, bookId) => run((db) => {
      if (!db.current_reads.some((c) => c.child_id === childId && c.book_id === bookId))
        db.current_reads.push({ child_id: childId, book_id: bookId });
    }, true),
    removeCurrentRead: (childId, bookId) => run((db) => {
      db.current_reads = db.current_reads.filter((c) => !(c.child_id === childId && c.book_id === bookId));
    }, true),
    getProgress: (childId, bookId) => run((db) =>
      db.book_progress.find((p) => p.child_id === childId && p.book_id === bookId)
        ?? { child_id: childId, book_id: bookId, current_page: 1 }),
  },

  assignments: {
    list: (childId) => run((db) =>
      db.assignments.filter((a) => !childId || a.child_id === childId)
        .sort((a, b) => a.due_date.localeCompare(b.due_date))),
    create: (input) => run((db) => {
      const a = { id: uid('a'), ...input, progress_pct: 0, status: 'not_started' as const };
      db.assignments.push(a);
      if (!db.current_reads.some((c) => c.child_id === input.child_id && c.book_id === input.book_id))
        db.current_reads.push({ child_id: input.child_id, book_id: input.book_id });
      return a;
    }, true),
    update: (id, patch) => run((db) => {
      const a = need(db.assignments.find((x) => x.id === id), 'Assignment not found');
      Object.assign(a, patch);
      return a;
    }, true),
    remove: (id) => run((db) => {
      db.assignments = db.assignments.filter((a) => a.id !== id);
    }, true),
  },

  sessions: {
    list: (childId) => run((db) =>
      db.sessions.filter((s) => s.child_id === childId)
        .sort((a, b) => b.started_at.localeCompare(a.started_at))),
    getLiveState: (childId) => run((db) => getLive(db, childId)),
    start: (childId, bookId) => run((db) => {
      const live = getLive(db, childId);
      if (live.session_id) endSessionInDb(db, live.session_id, 'child');
      const session: ReadingSession = {
        id: uid('s'), child_id: childId, book_id: bookId, started_at: nowIso(), ended_at: null,
        state: 'active', ended_by: null, verified_minutes: 0, pages_read: 0, bonus_minutes: 0,
      };
      db.sessions.push(session);
      live.status = 'reading';
      live.session_id = session.id;
      live.paused = false;
      live.lockdown = { active: false, variant: null, app_name: null };
      live.updated_at = nowIso();
      return session;
    }, true),
    pause: (sessionId) => run((db) => {
      const session = need(db.sessions.find((s) => s.id === sessionId), 'Session not found');
      session.state = 'paused';
      const live = getLive(db, session.child_id);
      live.paused = true;
      live.updated_at = nowIso();
      return live;
    }, true),
    resume: (sessionId) => run((db) => {
      const session = need(db.sessions.find((s) => s.id === sessionId), 'Session not found');
      session.state = 'active';
      const live = getLive(db, session.child_id);
      live.paused = false;
      live.updated_at = nowIso();
      return live;
    }, true),
    recordProgress: (sessionId, progress) => run((db) => {
      const session = need(db.sessions.find((s) => s.id === sessionId), 'Session not found');
      session.verified_minutes = progress.verified_minutes;
      session.pages_read = progress.pages_read;
      const existing = db.book_progress.find((p) => p.child_id === session.child_id && p.book_id === session.book_id);
      if (existing) existing.current_page = progress.current_page;
      else db.book_progress.push({ child_id: session.child_id, book_id: session.book_id, current_page: progress.current_page });
    }, true),
    end: (sessionId, endedBy) => run((db) => endSessionInDb(db, sessionId, endedBy), true),
    parentOverride: (childId) => run((db) => {
      const live = getLive(db, childId);
      if (live.session_id) endSessionInDb(db, live.session_id, 'parent');
      live.status = 'idle';
      live.lockdown = { active: true, variant: 'override', app_name: null };
      live.updated_at = nowIso();
      return live;
    }, true),
    clearLockdown: (childId) => run((db) => {
      const live = getLive(db, childId);
      live.lockdown = { active: false, variant: null, app_name: null };
      live.status = live.session_id ? 'reading' : 'idle';
      live.updated_at = nowIso();
      return live;
    }, true),
    simulateBlockedApp: (childId, variant = 'blocked_app') => run((db) => {
      const live = getLive(db, childId);
      const blocked = db.rules.filter((r) => r.child_id === childId && r.kind === 'block');
      const app = blocked.length ? blocked[Math.floor(Math.random() * blocked.length)].exe_name : 'Game.exe';
      live.lockdown = { active: true, variant, app_name: app };
      live.status = 'locked';
      live.updated_at = nowIso();
      pushAlert(db, childId, 'blocked_app', 'low',
        variant === 'task_switch'
          ? 'Task switching was attempted during a reading session and blocked.'
          : `${app} was launched during a reading session and was closed.`);
      return live;
    }, true),
  },

  rules: {
    list: (childId) => run((db) => db.rules.filter((r) => r.child_id === childId)),
    add: (input) => run((db) => {
      const exe = input.exe_name.trim();
      if (!exe) throw new Error('Enter an application name, e.g. Game.exe');
      const rule = { id: uid('r'), child_id: input.child_id, kind: input.kind, exe_name: exe, path: input.path ?? null };
      db.rules.push(rule);
      return rule;
    }, true),
    update: (id, patch) => run((db) => {
      const rule = need(db.rules.find((r) => r.id === id), 'Rule not found');
      Object.assign(rule, patch);
      return rule;
    }, true),
    remove: (id) => run((db) => { db.rules = db.rules.filter((r) => r.id !== id); }, true),
  },

  rewards: {
    get: (childId) => run((db) => need(db.reward_settings.find((r) => r.child_id === childId), 'No reward settings')),
    save: (settings) => run((db) => {
      const existing = db.reward_settings.find((r) => r.child_id === settings.child_id);
      if (existing) Object.assign(existing, settings);
      else db.reward_settings.push(settings);
      return settings;
    }, true),
  },

  schedule: {
    get: (childId) => run((db) => db.schedule_blocks.filter((b) => b.child_id === childId)),
    save: (childId, blocks) => run((db) => {
      db.schedule_blocks = db.schedule_blocks.filter((b) => b.child_id !== childId);
      const created = blocks.map((b) => ({ ...b, id: uid('sb'), child_id: childId }));
      db.schedule_blocks.push(...created);
      return created;
    }, true),
  },

  alerts: {
    list: (childId) => run((db) =>
      db.alerts.filter((a) => !childId || a.child_id === childId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))),
    acknowledge: (id) => run((db) => {
      const alert = need(db.alerts.find((a) => a.id === id), 'Alert not found');
      alert.acknowledged = true;
    }, true),
    fire: (childId, type) => run((db) => {
      const copy: Record<AlertType, [AlertSeverity, string]> = {
        terminate_attempt: ['high', 'Attempt to end the GameRead process from Task Manager.'],
        file_modified: ['high', 'A GameRead program file was modified.'],
        clock_changed: ['medium', 'System clock was changed by 2 hours.'],
        blocked_app: ['low', 'A blocked application was launched and closed.'],
      };
      const [severity, message] = copy[type];
      return pushAlert(db, childId, type, severity, message);
    }, true),
  },

  playtime: {
    ledger: (childId) => run((db) =>
      db.ledger.filter((l) => l.child_id === childId).sort((a, b) => b.created_at.localeCompare(a.created_at))),
    wallet: (childId) => run((db) => computeWallet(db, childId)),
    spend: (childId, minutes, note = 'Play time') => run((db) => {
      const wallet = computeWallet(db, childId);
      if (minutes > wallet.balance_minutes) throw new Error('Not enough play time in the balance.');
      const entry = {
        id: uid('l'), child_id: childId, kind: 'spent' as const, minutes, session_id: null, note, created_at: nowIso(),
      };
      db.ledger.push(entry);
      return entry;
    }, true),
    startPlay: (childId, minutes) => run((db) => {
      const wallet = computeWallet(db, childId);
      if (minutes <= 0) throw new Error('Choose how long you want to play.');
      if (minutes > wallet.balance_minutes) throw new Error('Not enough play time in the balance.');
      db.ledger.push({
        id: uid('l'), child_id: childId, kind: 'spent', minutes, session_id: null, note: 'Play time', created_at: nowIso(),
      });
      const live = getLive(db, childId);
      live.status = 'playing';
      live.updated_at = nowIso();
      return live;
    }, true),
    endPlay: (childId) => run((db) => {
      const live = getLive(db, childId);
      live.status = live.session_id ? 'reading' : 'idle';
      live.updated_at = nowIso();
      return live;
    }, true),
  },

  stats: {
    get: (childId): Promise<Stats> => run((db) => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const daily = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const minutes = db.sessions
          .filter((s) => s.child_id === childId && isSameLocalDay(s.started_at, d))
          .reduce((sum, s) => sum + s.verified_minutes, 0);
        return { day: days[d.getDay()], minutes };
      });
      const weekSessions = db.sessions.filter((s) => {
        const age = Date.now() - new Date(s.started_at).getTime();
        return s.child_id === childId && age < 7 * 24 * 3600 * 1000;
      });
      return {
        // Monthly pages match the design slide (Jun 23, Jul 30, Aug 19).
        monthly_pages: [
          { month: 'June', pages: 23 }, { month: 'July', pages: 30 }, { month: 'August', pages: 19 },
        ],
        daily_minutes: daily,
        weekly_minutes: weekSessions.reduce((s, x) => s + x.verified_minutes, 0),
        weekly_pages: weekSessions.reduce((s, x) => s + x.pages_read, 0),
      };
    }),
  },

  preferences: {
    get: () => run((db) => db.preferences),
    save: (patch) => run((db) => {
      Object.assign(db.preferences, patch);
      return db.preferences;
    }, true),
  },

  subscribe(onChange) {
    if (!channel) return () => undefined;
    const handler = (): void => onChange();
    channel.addEventListener('message', handler);
    return () => channel.removeEventListener('message', handler);
  },

  async resetDemo() {
    await wait();
    commit(buildSeed());
  },
};

export { CHILD_ID };
