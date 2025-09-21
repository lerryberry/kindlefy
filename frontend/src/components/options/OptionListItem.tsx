import React from 'react';
import styled from 'styled-components';
import ArrowButton from '../util/ArrowButton';

interface OptionListItemProps {
    title: string;
    onArrowClick?: () => void;
}

const ListItem = styled.div`
    padding: 0 16px;
    border-bottom: 1px solid var(--color-border-primary);
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 48px;
    background-color: var(--color-background-tertiary);
    transition: all 0.2s ease;
    border-radius: 0.5rem;
    margin: 0.25rem 0;
    
    &:last-child {
        border-bottom: none;
    }
`;

const OptionTitle = styled.div`
    font-weight: 500;
    cursor: grab;
    display: flex;
    align-items: center;
`;

const DragHandle = styled.span`
    opacity: 0;
    transition: opacity 0.5s ease;
    margin-top: 3px;
    margin-right: 4px;
    
    ${ListItem}:hover & {
        opacity: 1;
    }
`;

const OptionListItem: React.FC<OptionListItemProps> = ({ title, onArrowClick }) => {

    return (
        <ListItem data-list-item="true">
            <div>
                <OptionTitle>
                    <DragHandle>{'\u283F'}</DragHandle>{title}
                </OptionTitle>
            </div>
            {onArrowClick && <ArrowButton size="small" direction="forward" onClick={onArrowClick} />}
        </ListItem>
    );
};

export default OptionListItem;
