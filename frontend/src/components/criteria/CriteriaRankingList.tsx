import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useGetCriteriaList } from "./useGetCriteria";
import Accordion, { type AccordionRef } from "../util/Accordion";
import PageLayout from "../layouts/PageLayout";
import OptionsList, { type OptionsListRef } from "../options/OptionsList";
import StatusIndicator from "../util/StatusIndicator";
import EmptyState from "../util/EmptyState";
import styled from "styled-components";
import type { UseGetCriteriaListReturn } from "../../types/criteria";
import { useRef, useState } from "react";

const ListContainer = styled.div`
    /* Background will inherit from parent or use global styles */
`;

export default function CriteriaRankingList() {
    const navigate = useNavigate();
    const { decisionId } = useParams();
    const location = useLocation();
    const { data, isLoading, error }: UseGetCriteriaListReturn = useGetCriteriaList(decisionId!);
    const accordionRefs = useRef<{ [key: number]: AccordionRef }>({});
    const optionsListRefs = useRef<{ [key: number]: OptionsListRef }>({});
    const [openAccordion, setOpenAccordion] = useState<number | null>(null);

    // Determine if we're on the ranking page
    const isRankingPage = location.pathname.includes('/ranking');
    const nextButtonAction = isRankingPage ?
        () => navigate(`/decisions/${decisionId}/decide`) :
        () => navigate(`/decisions/${decisionId}/ranking`);

    // Function to handle accordion toggle - only one can be open at a time
    const handleAccordionToggle = (accordionNumber: number, isOpen: boolean) => {
        if (isOpen) {
            // Only save the previously open accordion (if any) before closing it
            if (openAccordion !== null && openAccordion !== accordionNumber) {
                const previousOptionsRef = optionsListRefs.current[openAccordion];
                if (previousOptionsRef) {
                    previousOptionsRef.saveRankings();
                }
                // Programmatically close the previously open accordion
                accordionRefs.current[openAccordion]?.close();
            }
            setOpenAccordion(accordionNumber);
        } else {
            // On user-initiated close, trigger save on the corresponding options list
            const optionsRef = optionsListRefs.current[accordionNumber];
            if (optionsRef) {
                optionsRef.saveRankings();
            }
            setOpenAccordion(null);
        }
    };

    // Function to handle closing accordion after ranking is saved and opening next
    const handleRankingSaved = (accordionNumber: number) => {
        // Close current accordion
        const currentAccordionRef = accordionRefs.current[accordionNumber];
        if (currentAccordionRef) {
            currentAccordionRef.close();
        }
        setOpenAccordion(null);

        // Auto-open next accordion if it exists
        const nextAccordionNumber = accordionNumber + 1;
        const nextAccordionRef = accordionRefs.current[nextAccordionNumber];
        if (nextAccordionRef) {
            // Small delay for smooth UX - wait for close animation to complete
            setTimeout(() => {
                nextAccordionRef.open();
                setOpenAccordion(nextAccordionNumber);
            }, 300);
        }
    };

    if (isLoading) return <div>Loading criteria...</div>;
    if (error) return <div>Error: {error.message}</div>;

    // Show empty state if no criteria
    if (!data?.output || data.output.length === 0) {
        return (
            <PageLayout
                title="How do the options rank per criteria?"
                showBackButton={true}
                onBackClick={() => navigate(`/decisions/${decisionId}/criteria`)}
                showNextButton={true}
                onNextClick={nextButtonAction}
            >
                <EmptyState
                    text="No criteria found. Add criteria to start ranking options."
                />
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="How do the options rank per criteria?"
            showBackButton={true}
            onBackClick={() => navigate(`/decisions/${decisionId}/criteria`)}
            showNextButton={true}
            onNextClick={nextButtonAction}
        >
            <ListContainer>
                {data?.output?.map((criteria, index) => {
                    const accordionNumber = index + 1;
                    return (
                        <div key={criteria._id} data-accordion-number={accordionNumber}>
                            <Accordion
                                ref={(ref) => {
                                    if (ref) {
                                        accordionRefs.current[accordionNumber] = ref;
                                    }
                                }}
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <StatusIndicator isComplete={criteria.isRanked} size="medium" showMargin={true} />
                                        {criteria.title}
                                    </div>
                                }
                                onToggle={(isOpen) => handleAccordionToggle(accordionNumber, isOpen)}
                            >
                                <OptionsList
                                    ref={(ref) => {
                                        if (ref) {
                                            optionsListRefs.current[accordionNumber] = ref;
                                        } else {
                                            delete optionsListRefs.current[accordionNumber];
                                        }
                                    }}
                                    criterionId={criteria._id}
                                    onRankingSaved={() => handleRankingSaved(accordionNumber)}
                                    isAccordionOpen={openAccordion === accordionNumber}
                                />
                            </Accordion>
                        </div>
                    );
                })}
            </ListContainer>
        </PageLayout>
    );
}
