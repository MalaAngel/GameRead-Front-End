import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/queries';
import { DataState } from '@/components/ui';

interface RequireRoleProps {
  role: 'parent' | 'child';
  children: ReactNode;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { data: user, isLoading, isError, error } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <DataState isLoading>
          <div />
        </DataState>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream p-4">
        <DataState error={error}>
          <div />
        </DataState>
      </div>
    );
  }

  if (!user || user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}