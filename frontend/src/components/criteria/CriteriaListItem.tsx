import type { Criteria } from "../../types/criteria";
import styled from "styled-components";
import ArrowButton from "../util/ArrowButton";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

interface CriteriaListItemProps extends React.HTMLAttributes<HTMLDivElement> {
    criteriaObject: Criteria;
}

const ListItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-top: 1px solid black;
    
    &:hover {
        background-color: #f9fafb;
    }
`;

const Title = styled.div`
    color: #374151;
    font-weight: 500;
`;

const CriteriaListItem = ({ criteriaObject }: CriteriaListItemProps) => {
    const navigate = useNavigate();
    const { decisionId } = useParams();

    const handleClick = () => {
        navigate(`/decisions/${decisionId}/criteria/${criteriaObject._id}`);
    };

    return (
        <ListItem>
            <Title>
                <span style={{ marginRight: '0.5rem' }}>
                    {criteriaObject.isRanked ? '✅' : '⭕️'}
                </span>
                {criteriaObject.title}
            </Title>
            <ArrowButton size="small" direction="forward" onClick={handleClick} />
        </ListItem>
    );
};

export default CriteriaListItem;
