import React from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import styled from 'styled-components';
import { useDragAndDrop, type DragAndDropItem, type CategoryConfig } from '../../hooks/useDragAndDrop';
import DraggableItem from './DraggableItem';

export interface DraggableListProps<T extends DragAndDropItem> {
    initialCategories: Record<string, T[]>;
    categoryConfigs: CategoryConfig<T>[];
    onReorder: (categories: Record<string, T[]>) => void;
    onCategoryChange?: (item: T, newCategory: string) => T;
    renderItem: (item: T, index: number) => React.ReactNode;
    renderCategory?: (config: CategoryConfig<T>) => React.ReactNode;
    className?: string;
}

const CategoryContainer = styled.div<{ isUnsorted?: boolean }>`
  margin-bottom: 1rem;
  border: ${props => props.isUnsorted ? '1px dashed #ccc' : '1px solid #ccc'};
  padding: 1rem;
  border-radius: 0.5rem;
`;

const CategoryTitle = styled.h4`
  margin: 0 0 1rem 0;
`;

const DroppableArea = styled.div`
`;

const DefaultCategoryRenderer = <T extends DragAndDropItem>({
    config,
    items,
    renderItem
}: {
    config: CategoryConfig<T>;
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
}) => (
    <CategoryContainer isUnsorted={config.id === 'UNSORTED'} style={config.style}>
        <CategoryTitle>{config.title}</CategoryTitle>
        <Droppable droppableId={config.id}>
            {(provided) => (
                <DroppableArea
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                >
                    {items.map((item, index) => (
                        <div key={item.id}>
                            {item.id === 'new-criterion-form' ? (
                                // Render non-draggable content for the create-new form
                                renderItem(item, index)
                            ) : (
                                <DraggableItem
                                    index={index}
                                    draggableId={item.id}
                                >
                                    {renderItem(item, index)}
                                </DraggableItem>
                            )}
                        </div>
                    ))}
                    {provided.placeholder}
                </DroppableArea>
            )}
        </Droppable>
    </CategoryContainer>
);

export function DraggableList<T extends DragAndDropItem>({
    initialCategories,
    categoryConfigs,
    onReorder,
    onCategoryChange,
    renderItem,
    renderCategory,
    className
}: DraggableListProps<T>) {
    const { categories, onDragEnd } = useDragAndDrop({
        initialCategories,
        onReorder,
        onCategoryChange
    });



    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className={className}>
                {categoryConfigs.map((config) => {
                    const items = categories[config.id] || [];

                    if (renderCategory) {
                        return renderCategory({ ...config, items });
                    }

                    return (
                        <div key={config.id}>
                            <DefaultCategoryRenderer
                                config={config}
                                items={items}
                                renderItem={renderItem}
                            />
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
}

export default DraggableList;
