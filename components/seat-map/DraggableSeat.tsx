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
                "flex items-center justify-center cursor-move shadow-sm select-none z-10 hover:shadow-md hover:border-blue-400 font-bold text-sm transition-all",
                type === 'SEAT' && "bg-white border border-gray-300 rounded", // Removed fixed w/h
                type === 'WINDOW' && "bg-blue-200 border-2 border-blue-400 z-0",
                type === 'DOOR' && "bg-amber-800/20 border-2 border-amber-800 rounded-sm z-0",
                type === 'WALL' && "bg-gray-800 border-2 border-gray-900 z-0",
                isNew && "border-blue-500 bg-blue-50 ring-2 ring-blue-200",
                "data-[selected=true]:ring-2 data-[selected=true]:ring-primary data-[selected=true]:z-20"
            )}
            data-selected={isSelected}
        >
            {type === 'SEAT' && label}
            {type === 'WINDOW' && <div className="w-full h-1 bg-blue-400/50" />}
            {type === 'DOOR' && <div className="w-1/2 h-full border-r-2 border-dashed border-amber-800/50" />}
        </div>
    );
});
