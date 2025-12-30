import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { CSS } from '@dnd-kit/utilities';

export const DraggableSeat = React.memo(function DraggableSeat({ id, x, y, width = 1, height = 1, label, type, rotation, isNew, isSelected, onDoubleClick }: any) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id,
    });

    const gridSize = 30;

    const style = {
        transform: CSS.Translate.toString(transform),
        left: x * gridSize,
        top: y * gridSize,
        width: width * gridSize,
        height: height * gridSize,
        position: 'absolute' as const,
        touchAction: 'none',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onDoubleClick={onDoubleClick}
            className={cn(
                "flex items-center justify-center cursor-move shadow-sm select-none transition-all font-bold text-xs",
                "z-10", // Default Z-index
                type === 'SEAT' && "bg-white border border-gray-300 rounded text-black",
                type === 'WINDOW' && "bg-sky-200 border-2 border-sky-400 text-sky-700 rounded-sm",
                type === 'DOOR' && "bg-orange-200 border-2 border-orange-400 text-orange-800 rounded-sm",
                type === 'PILLAR' && "bg-gray-400 border-2 border-gray-600 text-white rounded-sm", // Concrete look
                type === 'WALL' && "bg-gray-800 border-2 border-gray-900 z-0", // Wall behind
                isNew && "border-blue-500 bg-blue-50 ring-2 ring-blue-200",
                "data-[selected=true]:ring-2 data-[selected=true]:ring-primary data-[selected=true]:z-30"
            )}
            data-selected={isSelected}
            data-draggable="true"
        >
            {type === 'SEAT' && label}
            {type === 'WINDOW' && "창문"}
            {type === 'DOOR' && "문"}
            {type === 'PILLAR' && "기둥"}
        </div>
    );
});
