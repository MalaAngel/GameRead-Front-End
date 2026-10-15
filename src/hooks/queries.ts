import { useQuery } from '@tanstack/react-query';
import { api } from '@/services';

/**
 * Read hooks. Screens use these and NEVER import the service layer or seed data directly.
 * Each hook disables itself until its id argument is available.
 */
export const keys = {
  user: ['user'] as const,
  children: ['children'] as const,
  child: (id: string) => ['child', id] as const,
  books: ['books'] as const,
  currentReads: (childId: string) => ['currentReads', childId] as const,
  progress: (childId: string, bookId: string) => ['progress', childId, bookId] as const,
  assignments: (childId?: string) => ['assignments', childId ?? 'all'] as const,
  sessions: (childId: string) => ['sessions', childId] as const,
  live: (childId: string) => ['live', childId] as const,
  rules: (childId: string) => ['rules', childId] as const,
  rewards: (childId: string) => ['rewards', childId] as const,
  schedule: (childId: string) => ['schedule', childId] as const,
  alerts: (childId?: string) => ['alerts', childId ?? 'all'] as const,
  ledger: (childId: string) => ['ledger', childId] as const,
  wallet: (childId: string) => ['wallet', childId] as const,
  stats: (childId: string) => ['stats', childId] as const,
  prefs: ['prefs'] as const,
};

export const useCurrentUser = () => useQuery({ queryKey: keys.user, queryFn: () => api.auth.getCurrentUser() });
export const useChildren = () => useQuery({ queryKey: keys.children, queryFn: () => api.children.list() });
export const useChild = (id: string | undefined) =>
  useQuery({ queryKey: keys.child(id ?? ''), queryFn: () => api.children.get(id!), enabled: !!id });
export const useBooks = () => useQuery({ queryKey: keys.books, queryFn: () => api.books.list() });
export const useCurrentReads = (childId: string | undefined) =>
  useQuery({ queryKey: keys.currentReads(childId ?? ''), queryFn: () => api.books.listCurrentReads(childId!), enabled: !!childId });
export const useBookProgress = (childId: string | undefined, bookId: string | undefined) =>
  useQuery({ queryKey: keys.progress(childId ?? '', bookId ?? ''), queryFn: () => api.books.getProgress(childId!, bookId!), enabled: !!childId && !!bookId });
export const useAssignments = (childId?: string) =>
  useQuery({ queryKey: keys.assignments(childId), queryFn: () => api.assignments.list(childId) });
export const useSessions = (childId: string | undefined) =>
  useQuery({ queryKey: keys.sessions(childId ?? ''), queryFn: () => api.sessions.list(childId!), enabled: !!childId });
export const useLiveState = (childId: string | undefined) =>
  useQuery({ queryKey: keys.live(childId ?? ''), queryFn: () => api.sessions.getLiveState(childId!), enabled: !!childId });
export const useRules = (childId: string | undefined) =>
  useQuery({ queryKey: keys.rules(childId ?? ''), queryFn: () => api.rules.list(childId!), enabled: !!childId });
export const useRewardSettings = (childId: string | undefined) =>
  useQuery({ queryKey: keys.rewards(childId ?? ''), queryFn: () => api.rewards.get(childId!), enabled: !!childId });
export const useSchedule = (childId: string | undefined) =>
  useQuery({ queryKey: keys.schedule(childId ?? ''), queryFn: () => api.schedule.get(childId!), enabled: !!childId });
export const useAlerts = (childId?: string) =>
  useQuery({ queryKey: keys.alerts(childId), queryFn: () => api.alerts.list(childId) });
export const useLedger = (childId: string | undefined) =>
  useQuery({ queryKey: keys.ledger(childId ?? ''), queryFn: () => api.playtime.ledger(childId!), enabled: !!childId });
export const useWallet = (childId: string | undefined) =>
  useQuery({ queryKey: keys.wallet(childId ?? ''), queryFn: () => api.playtime.wallet(childId!), enabled: !!childId });
export const useStats = (childId: string | undefined) =>
  useQuery({ queryKey: keys.stats(childId ?? ''), queryFn: () => api.stats.get(childId!), enabled: !!childId });
export const usePreferences = () => useQuery({ queryKey: keys.prefs, queryFn: () => api.preferences.get() });
