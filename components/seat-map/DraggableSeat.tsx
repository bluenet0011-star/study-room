import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { CSS } from '@dnd-kit/utilities';

export const DraggableSeat = React.memo(function DraggableSeat({ id, x, y, label, isNew }: any) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        left: x * 60, // Grid size 60px
        top: y * 60,
        position: 'absolute' as 'absolute',
        touchAction: 'none',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "w-12 h-12 bg-white border border-gray-300 rounded flex items-center justify-center cursor-move shadow-sm select-none z-10 hover:shadow-md hover:border-blue-400 font-bold text-sm",
                isNew && "border-blue-500 bg-blue-50"
            )}
        >
            {label}
        </div>
    );
});
