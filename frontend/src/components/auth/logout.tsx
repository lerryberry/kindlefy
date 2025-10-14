import { useAuth0 } from "@auth0/auth0-react";
import styled from 'styled-components';

const LogoutLink = styled.button`
    text-decoration: none;
    color: var(--color-text-primary);
    font-weight: 500;
    background: none;
    border: none;
    font-size: inherit;
    font-family: inherit;
    cursor: pointer;
    padding: 0;
    width: 100%;
    text-align: left;
    
    @media (max-width: 768px) {
        text-align: right;
    }
    
    &:hover {
        color: var(--color-text-secondary);
    }
`;

const LogoutButton = () => {
    const { logout } = useAuth0();

    const handleLogout = () => {
        logout({ logoutParams: { returnTo: window.location.origin } });
    };

    return (
        <LogoutLink onClick={handleLogout}>
            Log Out
        </LogoutLink>
    );
};

export default LogoutButton;