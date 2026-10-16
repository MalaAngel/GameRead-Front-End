import { Navigate, Route, Routes } from 'react-router-dom';
import { ChildLayout } from '@/layouts/ChildLayout';
import { ParentLayout } from '@/layouts/ParentLayout';
import { Showcase } from '@/features/dev/Showcase';
import { ChildHome } from '@/features/child/ChildHome';
import { ChildTasks } from '@/features/child/ChildTasks';
import { ChildHistory } from '@/features/child/ChildHistory';
import { ChildSettings } from '@/features/child/ChildSettings';
import { Reader } from '@/features/child/Reader';

import { AuthPage } from '@/features/auth/AuthPage';
import { RequireRole } from '@/features/auth/RequireRole';

// Import newly created parent pages
import { DashboardPage } from '@/features/parent/DashboardPage';
import { FamilyPage } from '@/features/parent/FamilyPage';
import { TasksPage } from '@/features/parent/TasksPage';
import { RulesPage } from '@/features/parent/RulesPage';
import { PlaytimePage } from '@/features/parent/PlaytimePage';
import { SettingsPage } from '@/features/parent/SettingsPage';

/**
 * The single, flat route table with Jules's authentication & role guards.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />

      <Route
        path="/parent"
        element={
          <RequireRole role="parent">
            <ParentLayout />
          </RequireRole>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="family" element={<FamilyPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="rules" element={<RulesPage />} />
        <Route path="playtime" element={<PlaytimePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route
        path="/child"
        element={
          <RequireRole role="child">
            <ChildLayout />
          </RequireRole>
        }
      >
        <Route index element={<ChildHome />} />
        <Route path="tasks" element={<ChildTasks />} />
        <Route path="history" element={<ChildHistory />} />
        <Route path="settings" element={<ChildSettings />} />
      </Route>

      {/* The reader has its own cream window with no sidebar. */}
      <Route
        path="/child/read/:bookId"
        element={
          <RequireRole role="child">
            <Reader />
          </RequireRole>
        }
      />

      <Route path="/dev/components" element={<Showcase />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}