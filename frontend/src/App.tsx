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
                success: { duration: 3000 },
                error: { duration: 3000 }
              }}
            />
          </RouteProtectProvider>
        </QueryProvider>
      </AuthProvider>
    </AnalyticsProvider>
  );
}

export default App;