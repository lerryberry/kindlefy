interface DecisionListItemProps {
    decisionObject: {
        title: string;
    };
}

const DecisionListItem = ({ decisionObject }: DecisionListItemProps) => {
    return (
        <div className="decision-item">
            <h3>{decisionObject.title}</h3>
        </div>
    );
};

export default DecisionListItem;