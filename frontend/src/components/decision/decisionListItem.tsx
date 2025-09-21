import styled from "styled-components";
import type { Decision } from "../../types/decision";
import { useNavigate } from "react-router-dom";
import ArrowButton from "../util/ArrowButton";
import Chip from "../util/Chip";

interface DecisionListItemProps {
  decisionObject: Decision;
  arrowClickable?: boolean;
}

const DecisionTile = styled.div`
  border: 1px solid var(--color-border-primary);
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: var(--color-background-secondary);
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  cursor: pointer;
  
  @media (min-width: 769px) {
    height: 7rem;
    padding: 0 1rem;
  }
`;

const DecisionTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  height: 100%;
  flex: 1;
`;

const ChipContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DecisionListItem = ({ decisionObject, arrowClickable = true }: DecisionListItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Check if decision is fully complete (has options, criteria, and is fully ranked)
    const isComplete = decisionObject.status?.hasOptions &&
      decisionObject.status?.hasCriteria &&
      decisionObject.status?.isFullyRanked;

    if (isComplete) {
      // Navigate to report page if decision is complete
      navigate(`/decisions/${decisionObject._id}/report`);
    } else {
      // Navigate to options page if decision is not complete
      navigate(`/decisions/${decisionObject._id}/options`);
    }
  };

  const handleArrowClick = () => {
    if (arrowClickable) {
      handleClick();
    }
  };

  // Capitalize the first letter of the title
  const capitalizedTitle = decisionObject.title && typeof decisionObject.title === 'string' ? decisionObject.title.charAt(0).toUpperCase() + decisionObject.title.slice(1) : decisionObject.title;

  // Check if all status booleans are true
  const isFullyComplete = decisionObject.status?.hasOptions &&
    decisionObject.status?.hasCriteria &&
    decisionObject.status?.isFullyRanked;

  return (
    <DecisionTile onClick={handleClick} data-list-item="true">
      <ContentContainer>
        <DecisionTitle>
          {capitalizedTitle}
        </DecisionTitle>
        {isFullyComplete && (
          <ChipContainer>
            <Chip variant="tag" success={true} ghost={true}>Report generated</Chip>
          </ChipContainer>
        )}
      </ContentContainer>
      <ArrowButton
        size="small"
        direction="forward"
        onClick={arrowClickable ? handleArrowClick : undefined}
      />
    </DecisionTile>
  );
};

export default DecisionListItem;