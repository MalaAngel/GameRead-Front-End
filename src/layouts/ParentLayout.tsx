import { Outlet } from 'react-router-dom';
import { Sidebar, type NavItem } from '@/components/ui';

const items: NavItem[] = [
  { label: 'Home', to: '/parent', end: true },
  { label: 'My Family', to: '/parent/family' },
  { label: 'Assigned Tasks', to: '/parent/tasks' },
  { label: 'Rules', to: '/parent/rules' },
  { label: 'Playtime & History', to: '/parent/playtime' },
];

/** Cream web layout with the blue rounded sidebar (slide: parent dashboard). */
export function ParentLayout() {
  return (
    <div className="min-h-full bg-cream">
      <div className="mx-auto flex min-h-screen max-w-[1280px] gap-6 p-5">
        <Sidebar items={items} settingsTo="/parent/settings" variant="card" subtitle="PARENT" className="self-start sticky top-5 min-h-[640px]" />
        <main className="min-w-0 flex-1 py-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
