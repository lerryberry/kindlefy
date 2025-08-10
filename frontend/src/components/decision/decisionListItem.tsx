import { Link } from "react-router-dom";
import type { DecisionListItemProps } from '../../types';

const DecisionListItem = ({ decisionObject }: DecisionListItemProps) => {
    return (
        <div className="decision-item">
            <Link to={`/decisions/${decisionObject._id}`}>
                <h3>{decisionObject.title}</h3>
            </Link>
        </div>
    );
};

export default DecisionListItem;