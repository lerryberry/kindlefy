import React from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import Option from './Option';

const OptionContainer = styled.div`
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
  padding: 1rem;
`;

const OptionPage: React.FC = () => {
    return (
        <>
            <OptionContainer>
                <Option />
            </OptionContainer>
            <Outlet />
        </>
    );
};

export default OptionPage;
