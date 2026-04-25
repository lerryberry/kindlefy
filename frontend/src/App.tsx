import { QueryProvider } from './providers/QueryProvider';
import { RouteProtectProvider, AuthProvider } from './providers/AuthProvider';
import { RouterProvider } from './providers/RouterProvider';
import { AnalyticsProvider } from './providers/AnalyticsProvider';
import { Toaster } from 'react-hot-toast';
import { GlobalStyle } from './styles/global';

function App() {
  return (
    <AnalyticsProvider>
      <AuthProvider>
        <QueryProvider>
          <RouteProtectProvider>
            <GlobalStyle />
            <RouterProvider />
            <Toaster
              position="top-center"
              gutter={12}
              containerStyle={{ margin: "8px" }}
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--color-background-secondary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-primary)',
                  boxShadow: '0 4px 14px rgba(28, 25, 23, 0.08)',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: 'var(--color-brand-600)',
                    secondary: 'var(--color-background-primary)',
                  },
                },
                error: {
                  duration: 3000,
                  iconTheme: {
                    primary: 'var(--color-error)',
                    secondary: 'var(--color-background-primary)',
                  },
                },
              }}
            />
          </RouteProtectProvider>
        </QueryProvider>
      </AuthProvider>
    </AnalyticsProvider>
  );
}

export default App;