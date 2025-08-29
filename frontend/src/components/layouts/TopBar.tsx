import { useState } from 'react';
import styled from 'styled-components';
import { Outlet, useNavigate } from 'react-router-dom';
import MainMenu from './MainMenu';

const TopBarContainer = styled.div`
  width: 100%;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  padding-left: 1.5rem;
  cursor: pointer;
`;

const BurgerMenu = styled.div`
  cursor: pointer;
  padding: 0.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const BurgerLine = styled.div`
  width: 20px;
  height: 2px;
  background-color: #374151;
`;

const MenuOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 250px;
  height: 100vh;
  background-color: #ffffff;
  border-left: 1px solid #e5e7eb;
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  z-index: 1000;
  padding: 2rem 1rem;
  box-shadow: ${props => props.isOpen ? '-2px 0 10px rgba(0,0,0,0.1)' : 'none'};
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
        <Logo onClick={handleLogoClick}>💎</Logo>
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