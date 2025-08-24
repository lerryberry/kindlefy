import type { Criteria } from "../../types/criteria";

interface CriteriaListItemProps {
    criteriaObject: Criteria;
}

const CriteriaListItem = ({ criteriaObject }: CriteriaListItemProps) => {
    return (
        <div>
            <h4>{criteriaObject.title}</h4>
            {criteriaObject.description && <p>{criteriaObject.description}</p>}
            <p>Priority: {criteriaObject.priority}</p>
        </div>
    );
};

export default CriteriaListItem;
