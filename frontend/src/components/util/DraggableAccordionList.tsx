import React from 'react';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import styled from 'styled-components';

type Id = string;

export interface DraggableAccordionListItem {
  id: Id;
}

export interface DraggableAccordionListProps<T extends DraggableAccordionListItem> {
  items: T[];
  openItemId: Id | null;
  onOpenChange: (next: Id | null) => void;
  onReorder: (orderedItems: T[]) => void;
  renderHeader: (item: T) => React.ReactNode;
  renderBody: (item: T) => React.ReactNode;
  className?: string;
}

const Wrap = styled.div`
  width: 100%;
`;

const Item = styled.div`
  border: 1px solid var(--color-border-primary);
  border-radius: 0.5rem;
  background: var(--color-background-secondary);
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: var(--color-background-tertiary);
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
`;

const DragHandle = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
  color: var(--color-text-primary);
  cursor: grab;
  opacity: 0.9;

  &:active {
    cursor: grabbing;
  }
`;

const Chevron = styled.span<{ $isOpen: boolean }>`
  transition: transform 0.2s ease;
  transform: ${(p) => (p.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  color: var(--color-text-primary);
  flex-shrink: 0;
`;

const Body = styled.div<{ $isOpen: boolean }>`
  max-height: ${(p) => (p.$isOpen ? '1500px' : '0')};
  overflow: hidden;
  transition: max-height 0.25s ease;
  border-top: 1px solid var(--color-border-primary);
  background-color: var(--color-background-secondary);
`;

const BodyInner = styled.div`
  padding: 1rem;
`;

export default function DraggableAccordionList<T extends DraggableAccordionListItem>({
  items,
  openItemId,
  onOpenChange,
  onReorder,
  renderHeader,
  renderBody,
  className,
}: DraggableAccordionListProps<T>) {
  function handleDragEnd(result: DropResult) {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.index === source.index) return;

    const next = Array.from(items);
    const [moved] = next.splice(source.index, 1);
    next.splice(destination.index, 0, moved);
    onReorder(next);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="digest-contents">
        {(provided) => (
          <Wrap
            className={className}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {items.map((item, index) => {
              const isOpen = openItemId === item.id;
              return (
                <Draggable draggableId={item.id} index={index}>
                  {(dragProvided) => (
                    <Item ref={dragProvided.innerRef} {...dragProvided.draggableProps}>
                      <Header
                        onClick={() => onOpenChange(isOpen ? null : item.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onOpenChange(isOpen ? null : item.id);
                          }
                        }}
                      >
                        <HeaderLeft>
                          <DragHandle
                            {...dragProvided.dragHandleProps}
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            aria-label="Drag to reorder"
                            title="Drag to reorder"
                          >
                            {'⋮⋮'}
                          </DragHandle>
                          {renderHeader(item)}
                        </HeaderLeft>
                        <Chevron $isOpen={isOpen}>{'⌃'}</Chevron>
                      </Header>
                      <Body $isOpen={isOpen}>
                        <BodyInner>{renderBody(item)}</BodyInner>
                      </Body>
                    </Item>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </Wrap>
        )}
      </Droppable>
    </DragDropContext>
  );
}

