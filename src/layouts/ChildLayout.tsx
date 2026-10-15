import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar, WindowFrame, type NavItem } from '@/components/ui';
import { LockdownGate } from '@/features/child/LockdownOverlay';

const items: NavItem[] = [
  { label: 'Home', to: '/child', end: true },
  { label: 'History', to: '/child/history' },
  { label: 'Assigned Tasks', to: '/child/tasks' },
];

/** Pink desktop window with the left sidebar (slide: child home). */
export function ChildLayout() {
  const navigate = useNavigate();
  return (
    <WindowFrame tone="pink" onClose={() => navigate('/')}>
      <div className="flex h-full">
        <Sidebar items={items} settingsTo="/child/settings" />
        <main className="min-w-0 flex-1 overflow-y-auto px-6 pb-6 pt-14 scroll-soft">
          <Outlet />
        </main>
      </div>
      <LockdownGate />
    </WindowFrame>
  );
}
