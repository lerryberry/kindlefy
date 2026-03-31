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
    return (
        <Auth0Provider
            domain="https://dev-itmdwxuj71eew7hh.us.auth0.com"
            clientId="eUMhUBuJl8brZ6LDgD2cXrXPb65d7G90"
            authorizationParams={{
                redirect_uri: 'kindlefy-b0b7da295fd7.herokuapp.com/',
                audience: 'auth0-m2m-endpoint',
                scope: 'openid profile email'
            }}
            cacheLocation="localstorage"
        >
            {children}
        </Auth0Provider >
    )
}