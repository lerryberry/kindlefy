import React from 'react';
import styled from 'styled-components';

interface BackButtonProps {
    onClick?: () => void;
}

const BackButtonContainer = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            window.history.back();
        }
    };

    return (
        <BackButtonContainer onClick={handleClick}>
            ←
        </BackButtonContainer>
    );
};

export default BackButton;
