import styled from "styled-components";
import type { Decision } from "../../types/decision";
import { useNavigate } from "react-router-dom";
import ArrowButton from "../util/ArrowButton";

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
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const DecisionTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
`;

const DecisionListItem = ({ decisionObject, arrowClickable = true }: DecisionListItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/decisions/${decisionObject._id}`);
  };

  const handleArrowClick = () => {
    if (arrowClickable) {
      handleClick();
    }
  };

  // Capitalize the first letter of the title
  const capitalizedTitle = decisionObject.title && typeof decisionObject.title === 'string' ? decisionObject.title.charAt(0).toUpperCase() + decisionObject.title.slice(1) : decisionObject.title;

  return (
    <DecisionTile onClick={handleClick} data-list-item="true">
      <div>
        <DecisionTitle>{capitalizedTitle}</DecisionTitle>
      </div>
      <ArrowButton
        size="small"
        direction="forward"
        onClick={arrowClickable ? handleArrowClick : undefined}
      />
    </DecisionTile>
  );
};

export default DecisionListItem;