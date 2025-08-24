import React from 'react';
import { useParams } from 'react-router-dom';
import CriteriaList from './CriteriaList';
import PageLayout from '../layouts/PageLayout';

const CriteriaPage: React.FC = () => {
    const { decisionId } = useParams<{ decisionId: string }>();

    if (!decisionId) {
        return <div>Decision ID is required</div>;
    }

    return (
        <PageLayout title="Criteria">
            <CriteriaList decisionId={decisionId} />
        </PageLayout>
    );
};

export default CriteriaPage;
