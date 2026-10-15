/**
 * Redeemability engine (F-07), the single source of truth for the reward formula.
 *
 *   bonusMinutes = min( floor(verifiedMinutes * ratio), dailyCapRemaining )
 *
 * In the real system this is validated server-side (NFR-05); the UI uses the same function
 * for previews and the session summary.
 */
export const DEFAULT_RATIO = 0.3;
export const DEFAULT_DAILY_CAP_MINUTES = 120;

export function bonusMinutes(
  verifiedMinutes: number,
  ratio: number,
  dailyCapRemaining: number,
): number {
  const earned = Math.floor(Math.max(0, verifiedMinutes) * Math.max(0, ratio));
  return Math.min(earned, Math.max(0, dailyCapRemaining));
}
