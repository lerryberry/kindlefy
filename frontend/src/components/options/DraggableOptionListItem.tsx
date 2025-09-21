import { Draggable } from '@hello-pangea/dnd';
import OptionListItem from './OptionListItem';
import type { GroupedOption } from '../../types/options'; // Import GroupedOption

export interface DraggableOptionListItemProps {
    option: GroupedOption;
    index: number;
}

const DraggableOptionListItem = ({ option, index }: DraggableOptionListItemProps) => {

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
                    />
                </div>
            )}
        </Draggable>
    );
};

export default DraggableOptionListItem;
