import type { Criteria } from "../../types/criteria";
import styled from "styled-components";
import RightArrow from "../util/RightArrow";
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
    cursor: pointer;
    
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
        <ListItem onClick={handleClick}>
            <Title>{criteriaObject.title}</Title>
            <RightArrow />
        </ListItem>
    );
};

export default CriteriaListItem;
