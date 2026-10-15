import { Navigate, Route, Routes } from 'react-router-dom';
import { ChildLayout } from '@/layouts/ChildLayout';
import { ParentLayout } from '@/layouts/ParentLayout';
import { Placeholder } from '@/features/Placeholder';
import { Showcase } from '@/features/dev/Showcase';
import { ChildHome } from '@/features/child/ChildHome';
import { ChildTasks } from '@/features/child/ChildTasks';
import { ChildHistory } from '@/features/child/ChildHistory';
import { ChildSettings } from '@/features/child/ChildSettings';
import { Reader } from '@/features/child/Reader';

/**
 * The single, flat route table. Everything else (session dialogs, add-reading, rules editors,
 * lockdown notice) is a modal / drawer / tab inside one of these screens.
 *
 * Replace each <Placeholder> with the real screen as the phases land.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Placeholder title="Sign up / Log in" phase="Phase 5" />} />

      <Route path="/parent" element={<ParentLayout />}>
        <Route index element={<Placeholder title="Parent dashboard" phase="Phase 4" />} />
        <Route path="family" element={<Placeholder title="My Family" phase="Phase 4" />} />
        <Route path="tasks" element={<Placeholder title="Assigned Tasks" phase="Phase 4" />} />
        <Route path="rules" element={<Placeholder title="Rules" phase="Phase 4" />} />
        <Route path="playtime" element={<Placeholder title="Playtime and History" phase="Phase 4" />} />
        <Route path="settings" element={<Placeholder title="Settings" phase="Phase 4" />} />
      </Route>

      <Route path="/child" element={<ChildLayout />}>
        <Route index element={<ChildHome />} />
        <Route path="tasks" element={<ChildTasks />} />
        <Route path="history" element={<ChildHistory />} />
        <Route path="settings" element={<ChildSettings />} />
      </Route>
      {/* The reader has its own cream window with no sidebar. */}
      <Route path="/child/read/:bookId" element={<Reader />} />

      <Route path="/dev/components" element={<Showcase />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
