/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH0_DOMAIN?: string;
  readonly VITE_AUTH0_CLIENT_ID?: string;
  readonly VITE_AUTH0_CLIENT_ID_PROD?: string;
  readonly VITE_AUTH0_CLIENT_ID_DEV?: string;
  readonly VITE_AUTH0_AUDIENCE?: string;
  readonly VITE_AUTH0_AUDIENCE_PROD?: string;
  readonly VITE_AUTH0_AUDIENCE_DEV?: string;
  readonly VITE_AUTH0_REDIRECT_URI?: string;
  readonly VITE_AUTH0_REDIRECT_URI_PROD?: string;
  readonly VITE_AUTH0_REDIRECT_URI_DEV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
