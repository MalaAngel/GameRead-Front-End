/**
 * Demo time-lapse: lets a reviewer see a "reading hour" in seconds.
 * 1 = real time, 60 = one real second counts as one reading minute. Set from the demo toolbar.
 */
const KEY = 'gameread.demoSpeed';

export function getDemoSpeed(): number {
  try {
    const v = Number(localStorage.getItem(KEY));
    return v > 0 ? v : 1;
  } catch {
    return 1;
  }
}

export function setDemoSpeed(speed: number): void {
  try { localStorage.setItem(KEY, String(speed)); } catch { /* ignore */ }
}
