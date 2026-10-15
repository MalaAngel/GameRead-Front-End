import type { DeviceStatus } from '@/types/db';
import { Pill } from './Pill';

const map: Record<DeviceStatus, { label: string; tone: 'ok' | 'warn' | 'danger' | 'blue' | 'cream' }> = {
  reading: { label: 'Reading', tone: 'ok' },
  locked: { label: 'Locked', tone: 'danger' },
  playing: { label: 'Playing', tone: 'blue' },
  idle: { label: 'Idle', tone: 'cream' },
  offline: { label: 'Offline', tone: 'warn' },
};

export function StatusChip({ status }: { status: DeviceStatus }) {
  const s = map[status];
  return <Pill tone={s.tone}><span className="h-2 w-2 rounded-full bg-current" aria-hidden />{s.label}</Pill>;
}
