import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetRankedOptions } from './useGetRankedOptions';
import EmptyState from '../util/EmptyState';
import OptionListItem from './OptionListItem';

const OptionsList: React.FC = () => {
    const navigate = useNavigate();
    const { decisionId, criterionId } = useParams();

    const { data, isLoading, error } = useGetRankedOptions(criterionId!);

    const handleAddOption = () => {
        navigate(`/decisions/${decisionId}/criteria/${criterionId}/options/new`);
    };

    if (isLoading) return <div>Loading options...</div>;
    if (error) return <div>Error: {error.message}</div>;

    if (!data?.data || data.data.length === 0) {
        return (
            <EmptyState
                text="No options found for this criterion"
                createLinkText="Add Option"
                onCreateClick={handleAddOption}
            />
        );
    }

    return (
        <div>
            {data.data.map((option) => (
                <div key={option._id}>
                    <OptionListItem
                        _id={option._id}
                        title={option.title}
                        rank={option.rank}
                        matchLevel={option.matchLevel}
                    />
                </div>
            ))}

            <button
                onClick={handleAddOption}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    padding: 0,
                    font: 'inherit',
                    textDecoration: 'underline'
                }}
            >
                + add option
            </button>
        </div>
    );
};

export default OptionsList;
