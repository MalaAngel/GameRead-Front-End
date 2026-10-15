import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui';
import { ActiveChildProvider } from '@/hooks/useActiveChild';
import { useCrossTabSync } from '@/hooks/useCrossTabSync';
import { AppRoutes } from './routes';
import { DemoToolbar } from '@/components/DemoToolbar';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5_000, refetchOnWindowFocus: false, retry: 1 } },
});

function Providers({ children }: { children: React.ReactNode }) {
  useCrossTabSync();
  return <ActiveChildProvider>{children}</ActiveChildProvider>;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <HashRouter>
          <Providers>
            <AppRoutes />
            <DemoToolbar />
          </Providers>
        </HashRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
