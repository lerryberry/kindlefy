import React from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import RightArrow from '../util/RightArrow';

interface OptionListItemProps {
    _id: string;
    title: string;
    rank: number;
    matchLevel: string;
}

const ListItem = styled.div`
    padding: 1rem 0;
    border-bottom: 1px solid #e5e7eb;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    &:hover {
        background-color: #f9fafb;
    }
    
    &:last-child {
        border-bottom: none;
    }
`;

const OptionTitle = styled.div`
    font-weight: 500;
    margin-bottom: 0.25rem;
`;

const OptionDetails = styled.div`
    font-size: 0.875rem;
    color: #6b7280;
`;

const OptionListItem: React.FC<OptionListItemProps> = ({ _id, title, rank, matchLevel }) => {
    const navigate = useNavigate();
    const { decisionId } = useParams();

    const handleClick = () => {
        navigate(`/decisions/${decisionId}/options/${_id}`);
    };

    return (
        <ListItem onClick={handleClick}>
            <div>
                <OptionTitle>{title}</OptionTitle>
                <OptionDetails>
                    Rank: {rank} | Match: {matchLevel} | {_id}
                </OptionDetails>
            </div>
            <RightArrow />
        </ListItem>
    );
};

export default OptionListItem;
