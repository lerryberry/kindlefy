import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

export function RouteProtectProvider({ children }: { children: React.ReactNode }) {
    const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            loginWithRedirect({
                appState: { returnTo: window.location.pathname }
            });
        }
    }, [isLoading, isAuthenticated, loginWithRedirect]);

    if (isLoading || !isAuthenticated) return <div>Loading...</div>;
    return <>
        {children}
    </>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
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
            { children }
        </Auth0Provider >
    )
}