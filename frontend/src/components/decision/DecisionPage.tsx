import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import Decision from './Decision';
import CriteriaList from '../criteria/CriteriaList';
import PageLayout from '../layouts/PageLayout';

const DecisionContainer = styled.div`
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
  padding: 1rem;
`;

const DecisionPage: React.FC = () => {
    const { decisionId } = useParams<{ decisionId: string }>();

    if (!decisionId) {
        return <div>Decision ID is required</div>;
    }

    return (
        <>
            <DecisionContainer>
                <Decision />
            </DecisionContainer>
            <PageLayout title="Criteria">
                <CriteriaList decisionId={decisionId} />
            </PageLayout>
        </>
    );
};

export default DecisionPage;
