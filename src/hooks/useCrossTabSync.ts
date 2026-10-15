import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/services';

/** Refreshes data when another tab (e.g. the parent dashboard) changes it. Maps to Supabase Realtime later. */
export function useCrossTabSync(): void {
  const qc = useQueryClient();
  useEffect(() => api.subscribe(() => { void qc.invalidateQueries(); }), [qc]);
}
