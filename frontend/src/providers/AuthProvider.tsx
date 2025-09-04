import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { consoleLogger } from "../utils/consoleLogger";

export function RouteProtectProvider({ children }: { children: React.ReactNode }) {
    const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();

    useEffect(() => {
        consoleLogger.auth.event('RouteProtectProvider mounted', { isLoading, isAuthenticated });

        if (!isLoading && !isAuthenticated) {
            consoleLogger.auth.event('Redirecting to login');
            loginWithRedirect({
                appState: { returnTo: window.location.pathname }
            });
        }
    }, [isLoading, isAuthenticated, loginWithRedirect]);

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
            domain="auth.krystallise.com"
            clientId="sZ2ckim3v3suG8XLZCPoF24ueQCIl3co"
            authorizationParams={{
                redirect_uri: window.location.origin,
                audience: 'auth0-m2m-endpoint',
                scope: 'openid profile email'
            }}
            cacheLocation="localstorage"
        >
            {children}
        </Auth0Provider >
    )
}