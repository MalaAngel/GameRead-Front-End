import type { DeviceStatus } from '@/types/db';
import { Pill } from './Pill';

const map: Record<DeviceStatus | string, { label: string; tone: 'ok' | 'warn' | 'danger' | 'blue' | 'cream' }> = {
  reading: { label: 'Reading', tone: 'ok' },
  locked: { label: 'Locked', tone: 'danger' },
  playing: { label: 'Playing', tone: 'blue' },
  idle: { label: 'Idle', tone: 'cream' },
  offline: { label: 'Offline', tone: 'warn' },
  // Fallbacks for generic or unknown status values
  active: { label: 'Active', tone: 'ok' },
  inactive: { label: 'Inactive', tone: 'warn' },
};

export function StatusChip({ status }: { status?: DeviceStatus | string }) {
  const fallback = { label: 'Idle', tone: 'cream' as const };
  const s = (status && map[status]) ? map[status] : fallback;

  return (
    <Pill tone={s.tone}>
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden />
      {s.label}
    </Pill>
  );
}