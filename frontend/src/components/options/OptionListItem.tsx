import React from 'react';
import styled from 'styled-components';
import ArrowButton from '../util/ArrowButton';

interface OptionListItemProps {
    title: string;
    onArrowClick?: () => void;
}

const ListItem = styled.div`
    padding: 1rem 0;
    border-bottom: 1px solid #e5e7eb;
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
    cursor: grab;
`;

const OptionListItem: React.FC<OptionListItemProps> = ({ title, onArrowClick }) => {

    return (
        <ListItem>
            <div>
                <OptionTitle>
                    <span>{'\u283F\u00a0'}</span>{title}
                </OptionTitle>
            </div>
            <ArrowButton size="small" direction="forward" onClick={onArrowClick} />
        </ListItem>
    );
};

export default OptionListItem;
