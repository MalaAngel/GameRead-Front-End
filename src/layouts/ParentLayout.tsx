import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Sidebar, type NavItem, useToast } from '@/components/ui';
import { useSignOut } from '@/hooks/mutations';

const items: NavItem[] = [
  { label: 'Home', to: '/parent', end: true },
  { label: 'My Family', to: '/parent/family' },
  { label: 'Assigned Tasks', to: '/parent/tasks' },
  { label: 'Rules', to: '/parent/rules' },
  { label: 'Playtime & History', to: '/parent/playtime' },
];

/** Cream web layout with the blue rounded sidebar (slide: parent dashboard). */
export function ParentLayout() {
  const navigate = useNavigate();
  const toast = useToast();
  const signOutMutation = useSignOut();

  const handleSignOut = () => {
    signOutMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Signed out');
        navigate('/');
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const signOutFooter = (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signOutMutation.isPending}
      className="flex h-11 w-full items-center justify-center gap-2 text-sm uppercase tracking-wide transition-colors hover:bg-navy-faint text-cream-soft"
    >
      Sign Out <LogOut className="h-5 w-5" aria-hidden />
    </button>
  );

  return (
    <div className="min-h-full bg-cream">
      <div className="mx-auto flex min-h-screen max-w-[1280px] gap-6 p-5">
        <Sidebar
          items={items}
          settingsTo="/parent/settings"
          variant="card"
          subtitle="PARENT"
          footer={signOutFooter}
          className="self-start sticky top-5 min-h-[640px]"
        />
        <main className="min-w-0 flex-1 py-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}