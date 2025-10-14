import React from 'react';
import styled from 'styled-components';
import ArrowButton from './ArrowButton';

interface DraggableListItemProps {
    title?: string;
    onArrowClick?: () => void;
    children?: React.ReactNode;
}

const ListItem = styled.div`

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

const ItemTitle = styled.div`
    font-weight: 500;
    cursor: grab;
    display: flex;
    align-items: center;
`;

const DragHandle = styled.span`
    opacity: 0;
    transition: opacity 0.5s ease;
    display: flex;
    justify-content: center;
    font-size: 1.5rem;
    min-width: 2rem;
    padding-left: 3px;
    
    @media (max-width: 767px) {
        opacity: 1;
    }
    
    ${ListItem}:hover & {
        opacity: 1;
    }
`;

const DraggableListItem: React.FC<DraggableListItemProps> = ({ title, onArrowClick, children }) => {

    return (
        <ListItem data-list-item="true">
            <div>
                <ItemTitle>
                    <DragHandle>{'\u283F'}</DragHandle>
                    {title && title}
                </ItemTitle>
            </div>
            {children}
            {onArrowClick && <ArrowButton size="small" direction="forward" onClick={onArrowClick} />}
        </ListItem>
    );
};

export default DraggableListItem;
