import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';
import './index.css'

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <Auth0Provider
      domain="dev-d85syd7wejqy2nrm.us.auth0.com"
      clientId="sZ2ckim3v3suG8XLZCPoF24ueQCIl3co"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: 'http://localhost:3000',
        scope: 'openid profile email'
      }}
      cacheLocation="localstorage"
    >
      <App />
    </Auth0Provider>
  </StrictMode>
);