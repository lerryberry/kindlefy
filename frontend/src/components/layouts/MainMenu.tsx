import styled from 'styled-components';
import { Link } from 'react-router-dom';
import LogoutButton from '../auth/logout';

interface MainMenuProps {
    onClose?: () => void;
}

const MenuContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const MenuItem = styled.div`
    padding: 0.75rem 0;
    border-bottom: 1px solid #f3f4f6;
    
    &:last-child {
        border-bottom: none;
    }
`;

const MenuLink = styled(Link)`
    text-decoration: none;
    color: #374151;
    font-weight: 500;
    
    &:hover {
        color: #1f2937;
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
`;

export default function MainMenu({ onClose }: MainMenuProps) {
    return (
        <MenuContainer>
            <CloseButton onClick={onClose}>×</CloseButton>
            <MenuItem>
                <MenuLink to="/decisions" onClick={onClose}>Decisions</MenuLink>
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