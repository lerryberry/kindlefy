import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import PageLayout from '../layouts/PageLayout';
import { useGetOption } from './useGetOption';

const StatusBadge = styled.span<{ isArchived: boolean }>`
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: ${props => props.isArchived ? '#fee2e2' : '#dcfce7'};
    color: ${props => props.isArchived ? '#991b1b' : '#166534'};
`;

const OptionDetail: React.FC = () => {
    const { optionId } = useParams<{ optionId: string }>();

    if (!optionId) {
        return <div>Option ID is required</div>;
    }

    const { data: option, isLoading, error } = useGetOption(optionId);

    if (isLoading) return <div>Loading option...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!option?.data) return <div>Option not found</div>;

    return (
        <PageLayout title="">
            <div style={{ marginBottom: '1rem' }}>
                <strong>Description:</strong> {option.data.description || 'No description provided'}
            </div>

            <div>
                <strong>Status:</strong> <StatusBadge isArchived={option.data.isArchived}>
                    {option.data.isArchived ? 'Archived' : 'Active'}
                </StatusBadge>
            </div>
        </PageLayout>
    );
};

export default OptionDetail;
