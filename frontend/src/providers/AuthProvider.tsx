import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { auth0DomainHost, getAuth0RedirectUri, hasOAuthAuthorizationParams } from "../config/auth0";
import { consoleLogger } from "../utils/consoleLogger";
import { usePostHog } from "../hooks/usePostHog";

export function RouteProtectProvider({ children }: { children: React.ReactNode }) {
    const { isLoading, isAuthenticated, loginWithRedirect, user, error } = useAuth0();
    const posthog = usePostHog();

    useEffect(() => {
        consoleLogger.auth.event('RouteProtectProvider mounted', { isLoading, isAuthenticated });

        if (hasOAuthAuthorizationParams()) {
            return;
        }
        if (error) {
            return;
        }
        if (!isLoading && !isAuthenticated) {
            consoleLogger.auth.event('Redirecting to login');
            loginWithRedirect({
                appState: { returnTo: window.location.pathname },
                authorizationParams: { redirect_uri: getAuth0RedirectUri() },
            });
        }
    }, [isLoading, isAuthenticated, loginWithRedirect, error]);

    // Identify user in PostHog when authenticated
    useEffect(() => {
        if (isAuthenticated && user && user.sub) {
            posthog.identify(user.sub, {
                name: user.name,
                email: user.email,
                nickname: user.nickname,
                picture: user.picture,
                updated_at: user.updated_at
            });
        }
    }, [isAuthenticated, user, posthog]);

    if (error) {
        const message = error instanceof Error ? error.message : String(error);
        return (
            <div style={{ padding: '1.5rem', maxWidth: 480, margin: '2rem auto', fontFamily: 'system-ui' }}>
                <p style={{ marginBottom: '0.75rem' }}>Sign-in could not finish.</p>
                <pre style={{ fontSize: 12, overflow: 'auto', background: '#f5f5f4', padding: '0.75rem', borderRadius: 8 }}>{message}</pre>
                <button
                    type="button"
                    style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
                    onClick={() => {
                        window.location.replace(`${window.location.origin}${window.location.pathname}`);
                    }}
                >
                    Clear and try again
                </button>
            </div>
        );
    }

    if (isLoading || !isAuthenticated) {
        consoleLogger.debug('RouteProtectProvider: Loading or not authenticated');
        return <div>Loading...</div>;
    }

    consoleLogger.debug('RouteProtectProvider: User authenticated, rendering children');
    return <>
        {children}
    </>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const isProduction = import.meta.env.PROD;

    const defaultDomainRaw = isProduction
        ? "https://auth.kindleify.ai"
        : "https://dev-itmdwxuj71eew7hh.us.auth0.com";
    const auth0Domain = auth0DomainHost(
        import.meta.env.VITE_AUTH0_DOMAIN || defaultDomainRaw
    );

    // Allow dedicated prod/dev values while preserving single-value overrides.
    const defaultClientId = "eUMhUBuJl8brZ6LDgD2cXrXPb65d7G90";
    const auth0ClientId = isProduction
        ? (import.meta.env.VITE_AUTH0_CLIENT_ID_PROD || import.meta.env.VITE_AUTH0_CLIENT_ID || defaultClientId)
        : (import.meta.env.VITE_AUTH0_CLIENT_ID_DEV || import.meta.env.VITE_AUTH0_CLIENT_ID || defaultClientId);

    const defaultAudience = "auth0-m2m-endpoint";
    const auth0Audience = isProduction
        ? (import.meta.env.VITE_AUTH0_AUDIENCE_PROD || import.meta.env.VITE_AUTH0_AUDIENCE || defaultAudience)
        : (import.meta.env.VITE_AUTH0_AUDIENCE_DEV || import.meta.env.VITE_AUTH0_AUDIENCE || defaultAudience);

    const issuerRaw = import.meta.env.VITE_AUTH0_ISSUER?.trim();
    const issuer =
        issuerRaw && (issuerRaw.endsWith('/') ? issuerRaw : `${issuerRaw}/`);

    return (
        <Auth0Provider
            domain={auth0Domain}
            clientId={auth0ClientId}
            {...(issuer ? { issuer } : {})}
            authorizationParams={{
                redirect_uri: getAuth0RedirectUri(),
                audience: auth0Audience,
                scope: 'openid profile email'
            }}
            cacheLocation="localstorage"
        >
            {children}
        </Auth0Provider >
    )
}