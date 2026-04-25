import { useState } from 'react';
import styled from 'styled-components';
import { Outlet, useNavigate } from 'react-router-dom';
import MainMenu from './MainMenu';
import LogoMark from './LogoMark';
import { getActiveClientPlan } from '../../constants/clientPlan';

const TopBarContainer = styled.div`
  width: 100%;
  background-color: var(--color-background-secondary);
  border-bottom: 1px solid var(--color-border-primary);
  padding: 0.8rem;
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

const LogoMarkWrap = styled.div`
  height: 2.75rem;
  width: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;

  svg {
    display: block;
    height: 100%;
    width: auto;
  }
`;

const RightCluster = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

const PlansChip = styled.button`
  appearance: none;
  border: 1px solid var(--color-border-primary);
  background: var(--color-background-tertiary);
  color: var(--color-text-primary);
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 0.4rem 0.75rem;
  border-radius: 9999px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    border-color: var(--color-brand-500);
    color: var(--color-brand-600);
    background: var(--color-background-secondary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-brand-500);
    outline-offset: 2px;
  }
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
  const planChip = getActiveClientPlan().chipLabel;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const goPlans = () => {
    navigate('/plans');
  };

  return (
    <>
      <TopBarContainer>
        <Logo
          data-brand-logo="true"
          onClick={handleLogoClick}
          role="button"
          aria-label="Kindle-ify home"
        >
          <LogoMarkWrap>
            <LogoMark size={44} />
          </LogoMarkWrap>
        </Logo>
        <RightCluster>
          <PlansChip
            type="button"
            onClick={goPlans}
            aria-label={`Plans: ${planChip}`}
            title="View plans"
          >
            {planChip}
          </PlansChip>
          <BurgerMenu onClick={toggleMenu} role="button" tabIndex={0} aria-label="Open menu" onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleMenu();
            }
          }}>
            <BurgerLine />
            <BurgerLine />
            <BurgerLine />
          </BurgerMenu>
        </RightCluster>
      </TopBarContainer>



      <Overlay isOpen={isMenuOpen} onClick={closeMenu} />
      <MenuOverlay isOpen={isMenuOpen}>
        <MainMenu
          onClose={closeMenu}
        />
      </MenuOverlay>

      <Outlet />
    </>
  );
}