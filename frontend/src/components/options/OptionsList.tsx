import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useGetRankedOptions } from './useGetRankedOptions';
import type { MatchLevel, GroupedOption, RankingFormData, UseGetRankedOptionListReturn } from '../../types/options';
import EmptyState from '../util/EmptyState';
import Button from '../util/Button';
import toast from 'react-hot-toast';
import { useUpdateRankings } from './useUpdateRankings';
import DraggableOptionListItem from './DraggableOptionListItem';

const OptionsList: React.FC = () => {
    const navigate = useNavigate();
    const { decisionId, criterionId } = useParams<{ decisionId: string; criterionId: string }>();

    const { data: rankedOptionsData, isLoading, error, refetch }: UseGetRankedOptionListReturn = useGetRankedOptions(criterionId!); // Assuming this hook fetches all options for the decision, with ranking info for the current criterion
    const [groupedOptions, setGroupedOptions] = useState<Record<MatchLevel, GroupedOption[]>>({
        "UNSORTED": [],
        "BEST": [],
        "IMPARTIAL": [],
        "WORST": [],
    });
    const { mutate: updateRankings, isPending: isUpdatingRankings } = useUpdateRankings({
        decisionId: decisionId!,
        criterionId: criterionId!,
    });

    useEffect(() => {
        if (rankedOptionsData?.data) {
            const newGroupedOptions: Record<MatchLevel, GroupedOption[]> = {
                "UNSORTED": [],
                "BEST": [],
                "IMPARTIAL": [],
                "WORST": [],
            };

            rankedOptionsData.data.forEach(option => {
                // Ensure matchLevel is one of the valid MatchLevel types
                const matchLevel: MatchLevel = (option.matchLevel as MatchLevel) || "UNSORTED";
                newGroupedOptions[matchLevel].push({ ...option, matchLevel });
            });
            setGroupedOptions(newGroupedOptions);
        }
    }, [rankedOptionsData]);



    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        if (!destination) {
            return;
        }

        const sourceDroppableId = source.droppableId as MatchLevel;
        const destinationDroppableId = destination.droppableId as MatchLevel;

        const sourceOptions = Array.from(groupedOptions[sourceDroppableId]);
        const destOptions = Array.from(groupedOptions[destinationDroppableId]);
        const [movedOption] = sourceOptions.splice(source.index, 1);

        if (sourceDroppableId === destinationDroppableId) {
            // Reordering within the same list
            sourceOptions.splice(destination.index, 0, movedOption);
            setGroupedOptions(prev => ({
                ...prev,
                [sourceDroppableId]: sourceOptions
            }));
        } else {
            // Moving to a different list
            movedOption.matchLevel = destinationDroppableId;
            destOptions.splice(destination.index, 0, movedOption);
            setGroupedOptions(prev => ({
                ...prev,
                [sourceDroppableId]: sourceOptions,
                [destinationDroppableId]: destOptions
            }));
        }
    };

    const handleSaveRankings = () => {
        const rankingsToSubmit: RankingFormData[] = [];

        // Process "BEST", "IMPARTIAL", "WORST" categories for submission
        ["BEST", "IMPARTIAL", "WORST"].forEach(level => {
            groupedOptions[level as Exclude<MatchLevel, "UNSORTED">].forEach((option, index) => {
                rankingsToSubmit.push({
                    optionId: option._id,
                    criterionId: criterionId!,
                    matchLevel: level as Exclude<MatchLevel, "UNSORTED">,
                    rank: index + 1, // Add rank based on the order in the array
                });
            });
        });

        updateRankings(rankingsToSubmit, {
            onSuccess: () => {
                toast.success("Rankings saved successfully!");
                refetch(); // Refetch to ensure UI is consistent with backend
                navigate(`/decisions/${decisionId}`); // Navigate back to the decision detail page
            },
            onError: (err: Error) => {
                toast.error(`Failed to save rankings: ${err.message}`);
            },
        });
    };

    if (isLoading) return <div>Loading options...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const allOptionsEmpty = Object.values(groupedOptions).every(group => group.length === 0);

    if (allOptionsEmpty && !isLoading) {
        return (
            <EmptyState
                text="Add your first option. Once created, these are global and available to be ranked in all criteria."
                createLinkText="Add Option"
                onCreateClick={() => navigate(`/decisions/${decisionId}/criteria/${criterionId}/options/new`)}
            />
        );
    }

    const renderOptionGroup = (title: string, options: GroupedOption[], droppableId: MatchLevel) => (
        <div style={{
            marginBottom: '1rem',
            border: droppableId === "UNSORTED" ? '1px dashed #ccc' : '1px solid #ccc',
            padding: '1rem',
            borderRadius: '0.5rem'
        }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>{title}</h3>
            <Droppable droppableId={droppableId}>
                {(provided) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                    >
                        {options.map((option, index) => {
                            return (
                                <DraggableOptionListItem option={option} index={index} />
                            );
                        })}
                        {provided.placeholder}
                        {droppableId === "UNSORTED" && (
                            <button
                                onClick={() => navigate(`/decisions/${decisionId}/criteria/${criterionId}/options/new`)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#3b82f6',
                                    cursor: 'pointer',
                                    padding: 0,
                                    font: 'inherit',
                                    textDecoration: 'underline',
                                    marginTop: '1rem'
                                }}
                            >
                                + add option
                            </button>
                        )}
                    </div>
                )}
            </Droppable>
        </div>
    );

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            {renderOptionGroup("Unsorted", groupedOptions.UNSORTED, "UNSORTED")}
            {renderOptionGroup("Best Choice", groupedOptions.BEST, "BEST")}
            {renderOptionGroup("Impartial", groupedOptions.IMPARTIAL, "IMPARTIAL")}
            {renderOptionGroup("Worst Choice", groupedOptions.WORST, "WORST")}
            <Button
                text={isUpdatingRankings ? "Saving..." : "Save Rankings"}
                onClick={handleSaveRankings}
                disabled={isUpdatingRankings}
            />
        </DragDropContext>
    );
};

export default OptionsList;
