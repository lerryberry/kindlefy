import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import styled from 'styled-components';

export interface DraggableItemProps {
    index: number;
    children: React.ReactNode;
    draggableId: string;
}

const DraggableContainer = styled.div`
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
`;

export function DraggableItem({
    index,
    children,
    draggableId
}: DraggableItemProps) {
    return (
        <Draggable draggableId={draggableId} index={index}>
            {(provided) => (
                <DraggableContainer
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    {children}
                </DraggableContainer>
            )}
        </Draggable>
    );
}

export default DraggableItem;