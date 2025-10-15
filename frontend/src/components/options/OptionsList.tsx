import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetRankedOptions } from './useGetRankedOptions';
import type { MatchLevel, GroupedOption, RankingFormData, UseGetRankedOptionListReturn } from '../../types/options';
import Button from '../util/Button';
import toast from 'react-hot-toast';
import { useUpdateRankings } from './useUpdateRankings';
import DraggableList from '../util/DraggableList';
import DraggableListItem from '../util/DraggableListItem';
import type { CategoryConfig } from '../../hooks/useDragAndDrop';

interface OptionsListProps {
    criterionId?: string;
    onRankingSaved?: () => void;
    isAccordionOpen?: boolean;
}

const OptionsList: React.FC<OptionsListProps> = ({ criterionId: propCriterionId, onRankingSaved, isAccordionOpen = true }) => {
    const { decisionId, criterionId: urlCriterionId } = useParams<{ decisionId: string; criterionId: string }>();

    // Use prop criterionId if provided, otherwise fall back to URL param
    const criterionId = propCriterionId || urlCriterionId;

    const { data: rankedOptionsData, isLoading, error, refetch }: UseGetRankedOptionListReturn = useGetRankedOptions(criterionId!, isAccordionOpen);
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
                newGroupedOptions[matchLevel].push({
                    ...option,
                    matchLevel,
                    id: option._id // Add id property for generic drag and drop
                });
            });
            setGroupedOptions(newGroupedOptions);
        }
    }, [rankedOptionsData]);



    const handleReorder = (newCategories: Record<string, GroupedOption[]>) => {
        setGroupedOptions(newCategories as Record<MatchLevel, GroupedOption[]>);
    };

    const handleCategoryChange = (item: GroupedOption, newCategory: string): GroupedOption => {
        return { ...item, matchLevel: newCategory as MatchLevel };
    };

    const handleSaveRankings = () => {
        const rankingsToSubmit: RankingFormData[] = [];
        let globalRank = 1;

        // Process "BEST", "IMPARTIAL", "WORST" categories for submission
        // Process in order: BEST -> IMPARTIAL -> WORST
        ["BEST", "IMPARTIAL", "WORST"].forEach(level => {
            groupedOptions[level as Exclude<MatchLevel, "UNSORTED">].forEach((option) => {
                rankingsToSubmit.push({
                    optionId: option._id,
                    criterionId: criterionId!,
                    matchLevel: level as Exclude<MatchLevel, "UNSORTED">,
                    rank: globalRank++, // Global rank across all categories
                });
            });
        });

        updateRankings(rankingsToSubmit, {
            onSuccess: () => {
                toast.success("Rankings saved successfully!");
                refetch();
                onRankingSaved?.();
            }
        });
    };

    if (isLoading) return <div>Loading options...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const allOptionsEmpty = Object.values(groupedOptions).every(group => group.length === 0);
    const hasUnsortedOptions = groupedOptions.UNSORTED.length > 0;

    if (allOptionsEmpty && !isLoading) {
        return (
            <div>No options found. Add your first option to get started.</div>
        );
    }

    const categoryConfigs: CategoryConfig<GroupedOption>[] = [
        { id: "UNSORTED", title: "Unsorted", items: groupedOptions.UNSORTED },
        { id: "BEST", title: "Best Choice", items: groupedOptions.BEST },
        { id: "IMPARTIAL", title: "Impartial", items: groupedOptions.IMPARTIAL },
        { id: "WORST", title: "Worst Choice", items: groupedOptions.WORST },
    ];

    const renderOption = (option: GroupedOption) => (
        <DraggableListItem title={option.title} />
    );

    return (
        <>
            <DraggableList
                initialCategories={groupedOptions}
                categoryConfigs={categoryConfigs}
                onReorder={handleReorder}
                onCategoryChange={handleCategoryChange}
                renderItem={renderOption}
            />
            <Button
                text={isUpdatingRankings ? "Saving..." : "Save Rankings"}
                onClick={handleSaveRankings}
                disabled={isUpdatingRankings || hasUnsortedOptions}
                size="small"
            />
        </>
    );
};

export default OptionsList;