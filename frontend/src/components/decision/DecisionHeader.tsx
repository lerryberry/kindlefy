import React from 'react';
import styled from 'styled-components';
import { Outlet, useNavigate } from 'react-router-dom';
import Decision from './Decision';
import ArrowButton from '../util/ArrowButton';

const DecisionContainer = styled.div`
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--color-border-primary);
  background-color: var(--color-background-secondary);
  padding: 1rem;
  position: sticky;
  top: 60px; /* Assuming TopBar height is 60px */
  z-index: 99;
  width: 100%;
  box-sizing: border-box;
`;

const BackButtonContainer = styled.div`
  padding-left: 20px;
  margin-bottom: 1rem;
`;

const DecisionHeader: React.FC = () => {
    const navigate = useNavigate();
    return (
        <>
            <DecisionContainer>
                <Decision />
            </DecisionContainer>
            <BackButtonContainer>
                <ArrowButton size="large" direction="back" onClick={() => navigate(-1)} />
            </BackButtonContainer>
            <Outlet />
        </>
    );
};

export default DecisionHeader;
