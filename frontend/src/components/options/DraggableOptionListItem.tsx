import { Draggable } from '@hello-pangea/dnd';
import OptionListItem from './OptionListItem';
import type { GroupedOption } from '../../types/options'; // Import GroupedOption
import styled from 'styled-components';

export interface DraggableOptionListItemProps {
    option: GroupedOption;
    index: number;
}

const DraggableContainer = styled.div`
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
`;

const DraggableOptionListItem = ({ option, index }: DraggableOptionListItemProps) => {

    return (
        <Draggable draggableId={option._id} index={index}>
            {(provided) => (
                <DraggableContainer
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <OptionListItem
                        title={option.title}
                    />
                </DraggableContainer>
            )}
        </Draggable>
    );
};

export default DraggableOptionListItem;
