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
        position: 'absolute' as 'absolute',
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
                type === 'WINDOW' && "bg-blue-100 border border-blue-300 text-blue-600 rounded-sm",
                type === 'DOOR' && "bg-amber-100 border border-amber-300 text-amber-700 rounded-sm",
                type === 'PILLAR' && "bg-stone-300 border border-stone-400 text-stone-700 rounded-sm", // Concrete look
                type === 'WALL' && "bg-gray-800 border-2 border-gray-900 z-0", // Wall behind
                isNew && "border-blue-500 bg-blue-50 ring-2 ring-blue-200",
                "data-[selected=true]:ring-2 data-[selected=true]:ring-primary data-[selected=true]:z-30"
            )}
            data-selected={isSelected}
        >
            {type === 'SEAT' && label}
            {type === 'WINDOW' && "창문"}
            {type === 'DOOR' && "문"}
            {type === 'PILLAR' && "기둥"}
        </div>
    );
});
