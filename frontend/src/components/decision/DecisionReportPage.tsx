import React from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '../layouts/PageLayout';
import { useGetDecisionReport } from './useGetDecisionReport';

const DecisionReportPage: React.FC = () => {
    const { decisionId } = useParams<{ decisionId: string }>();

    if (!decisionId) {
        return <PageLayout title="Error"><div>Decision ID is required</div></PageLayout>;
    }

    const { data, isLoading, error } = useGetDecisionReport(decisionId);

    if (isLoading) return <PageLayout title="Loading Report..."><div>Loading decision report...</div></PageLayout>;
    if (error) return <PageLayout title="Error"><div>Error: {error.message}</div></PageLayout>;
    if (!data?.data || data.data.length === 0) return <PageLayout title="No Report Data"><div>No report data found for this decision.</div></PageLayout>;

    return (
        <PageLayout title="Decision Report">
            <h2>Options:</h2>
            <ul>
                {data.data.map((option) => (
                    <li key={option._id}>
                        {option.title} (Score: {option.score})
                        {option.tags && option.tags.length > 0 && (
                            <span> - Tags: {option.tags.join(', ')}</span>
                        )}
                    </li>
                ))}
            </ul>
        </PageLayout>
    );
};

export default DecisionReportPage;
