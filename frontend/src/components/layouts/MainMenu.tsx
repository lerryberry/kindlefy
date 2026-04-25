import styled from 'styled-components';
import { Link } from 'react-router-dom';
import LogoutButton from '../auth/logout';

interface MainMenuProps {
    onClose?: () => void;
}

const MenuContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const MenuItem = styled.div`
    padding: 1rem 0;
    border-bottom: 1px solid var(--color-border-primary);
    
    &:last-child {
        border-bottom: none;
    }
    
    @media (max-width: 768px) {
        text-align: right;
    }
`;

const MenuLink = styled(Link)`
    text-decoration: none;
    color: var(--color-text-primary);
    font-weight: 500;
    
    &:hover {
        color: var(--color-text-secondary);
    }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    margin-bottom: 1rem;
    align-self: flex-end;
    color: var(--color-text-primary);
`;

export default function MainMenu({ onClose }: MainMenuProps) {
    return (
        <MenuContainer>
            <CloseButton onClick={onClose}>×</CloseButton>
            <MenuItem>
                <MenuLink to="/" onClick={onClose}>Digests</MenuLink>
            </MenuItem>
            <MenuItem>
                <MenuLink to="/plans" onClick={onClose}>Plans</MenuLink>
            </MenuItem>
            <MenuItem>
                <MenuLink to="/profile" onClick={onClose}>Profile</MenuLink>
            </MenuItem>
            <MenuItem>
                <LogoutButton />
            </MenuItem>
        </MenuContainer>
    );
}