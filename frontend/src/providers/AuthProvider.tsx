import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { consoleLogger } from "../utils/consoleLogger";
import { usePostHog } from "../hooks/usePostHog";

export function RouteProtectProvider({ children }: { children: React.ReactNode }) {
    const { isLoading, isAuthenticated, loginWithRedirect, user } = useAuth0();
    const posthog = usePostHog();

    useEffect(() => {
        consoleLogger.auth.event('RouteProtectProvider mounted', { isLoading, isAuthenticated });

        if (!isLoading && !isAuthenticated) {
            consoleLogger.auth.event('Redirecting to login');
            loginWithRedirect({
                appState: { returnTo: window.location.pathname }
            });
        }
    }, [isLoading, isAuthenticated, loginWithRedirect]);

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

    const defaultDomain = isProduction
        ? "https://auth.kindleify.ai"
        : "https://dev-itmdwxuj71eew7hh.us.auth0.com";
    const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN || defaultDomain;

    // Allow dedicated prod/dev values while preserving single-value overrides.
    const defaultClientId = "eUMhUBuJl8brZ6LDgD2cXrXPb65d7G90";
    const auth0ClientId = isProduction
        ? (import.meta.env.VITE_AUTH0_CLIENT_ID_PROD || import.meta.env.VITE_AUTH0_CLIENT_ID || defaultClientId)
        : (import.meta.env.VITE_AUTH0_CLIENT_ID_DEV || import.meta.env.VITE_AUTH0_CLIENT_ID || defaultClientId);

    const defaultAudience = "auth0-m2m-endpoint";
    const auth0Audience = isProduction
        ? (import.meta.env.VITE_AUTH0_AUDIENCE_PROD || import.meta.env.VITE_AUTH0_AUDIENCE || defaultAudience)
        : (import.meta.env.VITE_AUTH0_AUDIENCE_DEV || import.meta.env.VITE_AUTH0_AUDIENCE || defaultAudience);

    return (
        <Auth0Provider
            domain={auth0Domain}
            clientId={auth0ClientId}
            authorizationParams={{
                redirect_uri: window.location.origin,
                audience: auth0Audience,
                scope: 'openid profile email'
            }}
            cacheLocation="localstorage"
        >
            {children}
        </Auth0Provider >
    )
}