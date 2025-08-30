import { Draggable } from '@hello-pangea/dnd';
import OptionListItem from './OptionListItem';
import { useParams, useNavigate } from 'react-router-dom';
import type { GroupedOption } from '../../types/options'; // Import GroupedOption

export interface DraggableOptionListItemProps {
    option: GroupedOption;
    index: number;
}

const DraggableOptionListItem = ({ option, index }: DraggableOptionListItemProps) => {
    const { decisionId } = useParams();
    const navigate = useNavigate();

    const handleClick = () => {
        if (decisionId) {
            navigate(`/decisions/${decisionId}/options/${option._id}`);
        }
    };

    return (
        <Draggable draggableId={option._id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <OptionListItem
                        title={option.title}
                        onArrowClick={handleClick}
                    />
                </div>
            )}
        </Draggable>
    );
};

export default DraggableOptionListItem;
