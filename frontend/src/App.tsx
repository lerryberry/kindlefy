import { QueryProvider } from './providers/QueryProvider';
import { RouteProtectProvider, AuthProvider } from './providers/AuthProvider';
import { RouterProvider } from './providers/RouterProvider';
import { Toaster } from 'react-hot-toast';
import { GlobalStyle } from './styles/global';

function App() {
  return (
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
  );
}

export default App;