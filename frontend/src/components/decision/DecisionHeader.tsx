import React from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import Decision from './Decision';
import BackButton from '../util/BackButton';

const DecisionContainer = styled.div`
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
  padding: 1rem;
  position: sticky;
  top: 60px; /* Assuming TopBar height is 60px */
  z-index: 99;
  width: 100%;
`;

const DecisionHeader: React.FC = () => {
    return (
        <>
            <DecisionContainer>
                <Decision />
            </DecisionContainer>
            <BackButton /> {/* Moved to below DecisionContainer */}
            <Outlet />
        </>
    );
};

export default DecisionHeader;
