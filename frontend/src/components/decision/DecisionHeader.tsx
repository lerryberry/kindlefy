import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Outlet, useParams } from 'react-router-dom';
import Decision from './Decision';
import { useGetDecision } from './useGetDecision';

const DecisionContainer = styled.div`
  border-bottom: 1px solid var(--color-border-primary);
  background-color: var(--color-background-secondary);
  padding: 1rem;
  position: sticky;
  top: 60px; /* Assuming TopBar height is 60px */
  z-index: 99;
  width: 100%;
  box-sizing: border-box;
`;

const DecisionHeader: React.FC = () => {
    const { decisionId } = useParams();
    const { decision } = useGetDecision(decisionId);

    // Set page title when decision is loaded
    useEffect(() => {
        if (decision?.data?.title) {
            const capitalizedTitle = decision.data.title.charAt(0).toUpperCase() + decision.data.title.slice(1);
            document.title = `Krystallise - ${capitalizedTitle}`;
        } else {
            document.title = 'Krystallise';
        }

        // Reset title when component unmounts
        return () => {
            document.title = 'Krystallise';
        };
    }, [decision?.data?.title]);

    return (
        <>
            <DecisionContainer>
                <Decision />
            </DecisionContainer>
            <Outlet />
        </>
    );
};

export default DecisionHeader;
