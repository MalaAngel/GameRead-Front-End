import type { GameReadApi } from './api';
import { mockApi } from './mockApi';

/**
 * THE swap point. When the Supabase backend is ready:
 *   1. create supabaseApi.ts implementing GameReadApi
 *   2. change the line below to `export const api: GameReadApi = supabaseApi;`
 * No screen or hook needs to change.
 */
export const api: GameReadApi = mockApi;
export type { GameReadApi };
