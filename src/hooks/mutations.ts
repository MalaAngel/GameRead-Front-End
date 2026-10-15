import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services';

/**
 * Write hooks. Every mutation refreshes all cached queries after success; simple and correct
 * for a prototype, and easy to narrow later.
 */
function useApiMutation<TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation<TResult, Error, TArgs>({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries(),
  });
}

type A = typeof api;

// auth
export const useSignUp = () => useApiMutation((i: Parameters<A['auth']['signUp']>[0]) => api.auth.signUp(i));
export const useSignIn = () => useApiMutation((i: Parameters<A['auth']['signIn']>[0]) => api.auth.signIn(i));
export const useDemoSignIn = () => useApiMutation((role: 'parent' | 'child') => api.auth.signInAsDemo(role));
export const useProviderSignIn = () => useApiMutation((p: 'google' | 'apple' | 'other') => api.auth.signInWithProvider(p));
export const useJoinWithCode = () => useApiMutation((code: string) => api.auth.joinWithFamilyCode(code));
export const useSignOut = () => useApiMutation(() => api.auth.signOut());

// children
export const useAddChild = () => useApiMutation((i: Parameters<A['children']['add']>[0]) => api.children.add(i));
export const useRemoveChild = () => useApiMutation((id: string) => api.children.remove(id));

// books / assignments
export const useAddCurrentRead = () => useApiMutation((v: { childId: string; bookId: string }) => api.books.addCurrentRead(v.childId, v.bookId));
export const useCreateAssignment = () => useApiMutation((i: Parameters<A['assignments']['create']>[0]) => api.assignments.create(i));
export const useUpdateAssignment = () => useApiMutation((v: { id: string; patch: Parameters<A['assignments']['update']>[1] }) => api.assignments.update(v.id, v.patch));
export const useRemoveAssignment = () => useApiMutation((id: string) => api.assignments.remove(id));

// sessions / lockdown
export const useStartSession = () => useApiMutation((v: { childId: string; bookId: string }) => api.sessions.start(v.childId, v.bookId));
export const usePauseSession = () => useApiMutation((id: string) => api.sessions.pause(id));
export const useResumeSession = () => useApiMutation((id: string) => api.sessions.resume(id));
export const useEndSession = () => useApiMutation((v: { sessionId: string; endedBy: 'child' | 'parent' }) => api.sessions.end(v.sessionId, v.endedBy));
export const useParentOverride = () => useApiMutation((childId: string) => api.sessions.parentOverride(childId));
export const useClearLockdown = () => useApiMutation((childId: string) => api.sessions.clearLockdown(childId));
export const useSimulateBlockedApp = () => useApiMutation((v: { childId: string; variant?: 'blocked_app' | 'task_switch' }) => api.sessions.simulateBlockedApp(v.childId, v.variant));

/** Progress pings are frequent and must not refetch everything, so this one invalidates nothing. */
export const useRecordProgress = () =>
  useMutation({
    mutationFn: (v: { sessionId: string; verified_minutes: number; pages_read: number; current_page: number }) =>
      api.sessions.recordProgress(v.sessionId, {
        verified_minutes: v.verified_minutes, pages_read: v.pages_read, current_page: v.current_page,
      }),
  });

// rules / rewards / schedule
export const useAddRule = () => useApiMutation((i: Parameters<A['rules']['add']>[0]) => api.rules.add(i));
export const useUpdateRule = () => useApiMutation((v: { id: string; patch: Parameters<A['rules']['update']>[1] }) => api.rules.update(v.id, v.patch));
export const useRemoveRule = () => useApiMutation((id: string) => api.rules.remove(id));
export const useSaveRewards = () => useApiMutation((s: Parameters<A['rewards']['save']>[0]) => api.rewards.save(s));
export const useSaveSchedule = () => useApiMutation((v: { childId: string; blocks: Parameters<A['schedule']['save']>[1] }) => api.schedule.save(v.childId, v.blocks));

// alerts / playtime / prefs / demo
export const useAcknowledgeAlert = () => useApiMutation((id: string) => api.alerts.acknowledge(id));
export const useFireAlert = () => useApiMutation((v: { childId: string; type: Parameters<A['alerts']['fire']>[1] }) => api.alerts.fire(v.childId, v.type));
export const useSpendPlaytime = () => useApiMutation((v: { childId: string; minutes: number }) => api.playtime.spend(v.childId, v.minutes));
export const useStartPlay = () => useApiMutation((v: { childId: string; minutes: number }) => api.playtime.startPlay(v.childId, v.minutes));
export const useEndPlay = () => useApiMutation((childId: string) => api.playtime.endPlay(childId));
export const useSavePreferences = () => useApiMutation((p: Parameters<A['preferences']['save']>[0]) => api.preferences.save(p));
export const useResetDemo = () => useApiMutation(() => api.resetDemo());
