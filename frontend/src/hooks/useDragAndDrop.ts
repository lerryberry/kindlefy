import { useState, useCallback, useEffect } from 'react';
import type { DropResult } from '@hello-pangea/dnd';

export interface DragAndDropItem {
    id: string;
    [key: string]: any;
}

export interface CategoryConfig<T extends DragAndDropItem> {
    id: string;
    title: string;
    items: T[];
    style?: React.CSSProperties;
}

export interface UseDragAndDropProps<T extends DragAndDropItem> {
    initialCategories: Record<string, T[]>;
    onReorder: (categories: Record<string, T[]>) => void;
    onCategoryChange?: (item: T, newCategory: string) => T;
}

export function useDragAndDrop<T extends DragAndDropItem>({
    initialCategories,
    onReorder,
    onCategoryChange
}: UseDragAndDropProps<T>) {
    const [categories, setCategories] = useState<Record<string, T[]>>(initialCategories);

    // Sync with initialCategories when they change
    useEffect(() => {
        setCategories(initialCategories);
    }, [initialCategories]);

    const onDragEnd = useCallback((result: DropResult) => {
        const { source, destination } = result;

        if (!destination) {
            return;
        }

        const sourceCategoryId = source.droppableId;
        const destinationCategoryId = destination.droppableId;

        const sourceItems = Array.from(categories[sourceCategoryId] || []);
        const destItems = Array.from(categories[destinationCategoryId] || []);
        const [movedItem] = sourceItems.splice(source.index, 1);

        if (sourceCategoryId === destinationCategoryId) {
            // Reordering within the same category
            sourceItems.splice(destination.index, 0, movedItem);
            const newCategories = {
                ...categories,
                [sourceCategoryId]: sourceItems
            };
            setCategories(newCategories);
            onReorder(newCategories);
        } else {
            // Moving to a different category
            const updatedItem = onCategoryChange
                ? onCategoryChange(movedItem, destinationCategoryId)
                : movedItem;

            destItems.splice(destination.index, 0, updatedItem);
            const newCategories = {
                ...categories,
                [sourceCategoryId]: sourceItems,
                [destinationCategoryId]: destItems
            };
            setCategories(newCategories);
            onReorder(newCategories);
        }
    }, [categories, onReorder, onCategoryChange]);

    const updateCategories = useCallback((newCategories: Record<string, T[]>) => {
        setCategories(newCategories);
    }, []);

    return {
        categories,
        onDragEnd,
        updateCategories
    };
}
