import type { Criteria } from "../../types/criteria";
import styled from "styled-components";
import ArrowButton from "../util/ArrowButton";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

interface CriteriaListItemProps extends React.HTMLAttributes<HTMLDivElement> {
    criteriaObject: Criteria;
    arrowClickable?: boolean;
}

const ListItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-top: 1px solid var(--color-border-primary);
    cursor: pointer;
    background-color: var(--color-background-secondary);
    transition: all 0.2s ease;
    border-radius: 0.5rem;
`;

const Title = styled.div`
    color: var(--color-text-primary);
    font-weight: 500;
`;

const CriteriaListItem = ({ criteriaObject, arrowClickable = true, ...props }: CriteriaListItemProps) => {
    const navigate = useNavigate();
    const { decisionId } = useParams();

    const handleClick = () => {
        navigate(`/decisions/${decisionId}/criteria/${criteriaObject._id}`);
    };

    const handleArrowClick = () => {
        if (arrowClickable) {
            handleClick();
        }
    };

    // Capitalize the first letter of the title
    const capitalizedTitle = criteriaObject.title && typeof criteriaObject.title === 'string' ? criteriaObject.title.charAt(0).toUpperCase() + criteriaObject.title.slice(1) : criteriaObject.title;

    return (
        <ListItem onClick={handleClick} data-list-item="true" {...props}>
            <Title>
                <span style={{ marginRight: '0.5rem' }}>
                    {criteriaObject.isRanked ? '✅' : '⭕️'}
                </span>
                {capitalizedTitle}
            </Title>
            <ArrowButton
                size="small"
                direction="forward"
                onClick={arrowClickable ? handleArrowClick : undefined}
            />
        </ListItem>
    );
};

export default CriteriaListItem;
