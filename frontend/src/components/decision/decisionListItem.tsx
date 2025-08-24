import { Link } from "react-router-dom";
import styled from "styled-components";
import type { Decision } from "../../types/decision";

interface DecisionListItemProps {
    decisionObject: Decision;
}

const DecisionTile = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: #ffffff;
  transition: box-shadow 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const DecisionTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
`;

const DecisionLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  
  &:hover {
    text-decoration: none;
  }
`;

const DecisionStatus = styled.div<{ isArchived: boolean }>`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${props => props.isArchived ? '#6b7280' : '#059669'};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DecisionListItem = ({ decisionObject }: DecisionListItemProps) => {
    return (
        <DecisionTile>
            <DecisionLink to={`/decisions/${decisionObject._id}`}>
                <DecisionTitle>{decisionObject.title}</DecisionTitle>
                <DecisionStatus isArchived={decisionObject.isArchived}>
                    {decisionObject.isArchived ? 'Archived' : 'Active'}
                </DecisionStatus>
            </DecisionLink>
        </DecisionTile>
    );
};

export default DecisionListItem;