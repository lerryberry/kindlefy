import React, { useState, useEffect, useRef } from 'react';
import DraggableList from '../util/DraggableList';
import DraggableListItem from '../util/DraggableListItem';
import CreateCriteriaListFormInput from './CreateCriteriaListFormInput';
import { useUpdateCriterion } from './useUpdateCriterion';
import { useUpdateCriteriaRankings } from './useUpdateCriteriaRankings';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { CategoryConfig } from '../../hooks/useDragAndDrop';
import type { CriteriaDragDropListProps, DraggableCriteria } from '../../types/common';

const CriteriaDragDropList: React.FC<CriteriaDragDropListProps> = ({ criteria }) => {
    const { decisionId } = useParams<{ decisionId: string }>();
    const { isUpdateSuccess } = useUpdateCriterion();
    const { updateCriteriaRankingsMutation, isSuccess: isRankingsSuccess } = useUpdateCriteriaRankings({ decisionId: decisionId! });

    const [groupedCriteria, setGroupedCriteria] = useState<Record<string, DraggableCriteria[]>>({
        "UNSORTED": [],
        "MUST_HAVE": [],
        "SHOULD_HAVE": [],
        "COULD_HAVE": [],
        "WONT_HAVE": [],
    });

    const [pendingChanges, setPendingChanges] = useState<Map<string, string>>(new Map());
    const autoSaveTimeoutRef = useRef<number | null>(null);

    useEffect(() => {

        const newGroupedCriteria: Record<string, DraggableCriteria[]> = {
            "UNSORTED": [],
            "MUST_HAVE": [],
            "SHOULD_HAVE": [],
            "COULD_HAVE": [],
            "WONT_HAVE": [],
        };

        // Sort criteria by globalRank first, then loop through and group by priority
        const sortedCriteria = [...criteria].sort((a, b) => ((a as any).globalRank || 0) - ((b as any).globalRank || 0));

        sortedCriteria.forEach(criterion => {
            const draggableCriterion: DraggableCriteria = {
                ...criterion,
                id: criterion._id
            };

            // Sort criteria into their corresponding priority categories
            const priority = criterion.priority;
            if (priority && newGroupedCriteria[priority]) {
                newGroupedCriteria[priority].push(draggableCriterion);
            } else {
                // Fallback to UNSORTED if priority doesn't match expected values
                newGroupedCriteria.UNSORTED.push(draggableCriterion);
            }
        });

        // Add the "Add new criterion" form to the top of the unsorted category
        const newCriterionForm: DraggableCriteria = {
            _id: 'new-criterion-form',
            title: '',
            description: '',
            priority: 'UNSORTED' as const,
            isRanked: false,
            isArchived: false,
            parentDecision: '',
            slug: 'new-criterion-form',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            id: 'new-criterion-form'
        };
        newGroupedCriteria.UNSORTED.unshift(newCriterionForm);

        setGroupedCriteria(newGroupedCriteria);
    }, [criteria]);

    // Show toast when criterion priority is successfully updated
    useEffect(() => {
        if (isUpdateSuccess) {
            toast.success("Criterion saved");
        }
    }, [isUpdateSuccess]);

    // Show toast when rankings are successfully updated
    useEffect(() => {
        if (isRankingsSuccess) {
            toast.success("Criteria rankings saved");
            setPendingChanges(new Map()); // Clear pending changes
        }
    }, [isRankingsSuccess]);

    // Debounced auto-save for keyboard navigation
    useEffect(() => {
        if (pendingChanges.size > 0) {
            // Clear existing timeout
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }

            // Set new timeout for 30 seconds
            autoSaveTimeoutRef.current = setTimeout(() => {
                savePendingChanges();
            }, 30000);
        }

        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [pendingChanges]);

    const savePendingChanges = () => {
        // Only save if there have been actual changes
        if (pendingChanges.size === 0) return;

        // Calculate global ranks across all criteria
        const rankings: Array<{ criterionId: string, priority: 'UNSORTED' | 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE' | 'WONT_HAVE', globalRank: number }> = [];

        // Create a flat list of all criteria in their current order
        const allCriteria: DraggableCriteria[] = [];

        // Process each priority category in order
        const priorityOrder = ['UNSORTED', 'MUST_HAVE', 'SHOULD_HAVE', 'COULD_HAVE', 'WONT_HAVE'];
        priorityOrder.forEach(priority => {
            const criteria = groupedCriteria[priority] || [];
            criteria.forEach(criterion => {
                // Skip the new criterion form
                if (criterion._id !== 'new-criterion-form') {
                    allCriteria.push(criterion);
                }
            });
        });

        // Only save if there are criteria to save
        if (allCriteria.length === 0) return;

        // Assign global ranks based on position in the flat list (starting at 1)
        allCriteria.forEach((criterion, globalIndex) => {
            rankings.push({
                criterionId: criterion._id,
                priority: criterion.priority,
                globalRank: globalIndex + 1
            });
        });

        updateCriteriaRankingsMutation(rankings);
    };

    const handleMouseOut = () => {
        savePendingChanges();
    };

    const handleReorder = (newCategories: Record<string, DraggableCriteria[]>) => {
        // Ensure the new criterion form is always at the top of UNSORTED category
        const processedCategories = { ...newCategories };
        if (processedCategories.UNSORTED) {
            const unsortedItems = processedCategories.UNSORTED;
            const newCriterionForm = unsortedItems.find(item => item._id === 'new-criterion-form');
            const otherItems = unsortedItems.filter(item => item._id !== 'new-criterion-form');
            
            // Put new criterion form at the top, then other items
            processedCategories.UNSORTED = newCriterionForm ? [newCriterionForm, ...otherItems] : otherItems;
        }

        setGroupedCriteria(processedCategories);

        // Track that changes have been made (for auto-save timeout)
        // We don't need to track specific changes since we save all criteria on mouse-out
        setPendingChanges(prev => {
            const newMap = new Map(prev);
            // Add a dummy entry to indicate changes were made
            newMap.set('reorder-changes', 'true');
            return newMap;
        });
    };

    const handleCategoryChange = (item: DraggableCriteria, newCategory: string): DraggableCriteria => {
        // Don't allow the new criterion form to be moved to other categories
        if (item._id === 'new-criterion-form') {
            return { ...item, priority: 'UNSORTED' as const };
        }

        // Track the change for batch saving
        setPendingChanges(prev => {
            const newMap = new Map(prev);
            newMap.set(item._id, newCategory);
            return newMap;
        });

        return { ...item, priority: newCategory as 'UNSORTED' | 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE' | 'WONT_HAVE' };
    };

    const renderCriteria = (criterion: DraggableCriteria) => {
        // Special case for the new criterion form
        if (criterion._id === 'new-criterion-form') {
            return (
                <CreateCriteriaListFormInput isNew={true} hidePriority={true} />
            );
        }

        return (
            <DraggableListItem>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                    <CreateCriteriaListFormInput
                        criterionId={criterion._id}
                        criterionTitle={criterion.title}
                        criterionPriority={criterion.priority}
                        hidePriority={true}
                    />
                </div>
            </DraggableListItem>
        );
    };

    const categoryConfigs: CategoryConfig<DraggableCriteria>[] = [
        { id: "UNSORTED", title: "Unsorted", items: groupedCriteria.UNSORTED },
        { id: "MUST_HAVE", title: "Must Have", items: groupedCriteria.MUST_HAVE },
        { id: "SHOULD_HAVE", title: "Should Have", items: groupedCriteria.SHOULD_HAVE },
        { id: "COULD_HAVE", title: "Could Have", items: groupedCriteria.COULD_HAVE },
        { id: "WONT_HAVE", title: "Won't Have", items: groupedCriteria.WONT_HAVE },
    ];

    return (
        <div onMouseLeave={handleMouseOut}>
            <DraggableList
                initialCategories={groupedCriteria}
                categoryConfigs={categoryConfigs}
                onReorder={handleReorder}
                onCategoryChange={handleCategoryChange}
                renderItem={renderCriteria}
            />
        </div>
    );
};

export default CriteriaDragDropList;
