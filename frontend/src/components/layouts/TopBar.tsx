import { useState } from 'react';
import styled from 'styled-components';
import { Outlet, useNavigate } from 'react-router-dom';
import MainMenu from './MainMenu';
import logo from '../../assets/logo.png';

const TopBarContainer = styled.div`
  width: 100%;
  background-color: var(--color-background-secondary);
  border-bottom: 1px solid var(--color-border-primary);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-sizing: border-box;
`;

const Logo = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const LogoImage = styled.img`
  height: 2rem;
  width: auto;
`;

const BurgerMenu = styled.div`
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const BurgerLine = styled.div`
  width: 20px;
  height: 2px;
  background-color: var(--color-text-primary);
`;

const MenuOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 250px;
  height: 100vh;
  background-color: var(--color-background-secondary);
  border-left: 1px solid var(--color-border-primary);
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  z-index: 1000;
  padding: 2rem 1rem;
  box-shadow: ${props => props.isOpen ? '-2px 0 10px rgba(0,0,0,0.3)' : 'none'};
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  z-index: 999;
`;

// Create a layout component
export default function TopBar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    navigate('/decisions');
  };

  return (
    <>
      <TopBarContainer>
        <Logo onClick={handleLogoClick}>
          <LogoImage src={logo} alt="Krystallise Logo" />
        </Logo>
        <BurgerMenu onClick={toggleMenu}>
          <BurgerLine />
          <BurgerLine />
          <BurgerLine />
        </BurgerMenu>
      </TopBarContainer>



      <Overlay isOpen={isMenuOpen} onClick={closeMenu} />
      <MenuOverlay isOpen={isMenuOpen}>
        <MainMenu onClose={closeMenu} />
      </MenuOverlay>

      <Outlet />
    </>
  );
}