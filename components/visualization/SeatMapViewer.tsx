'use client';
import { useState, useEffect } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function SeatMapViewer({ roomId }: { roomId: string }) {
    const [seats, setSeats] = useState<any[]>([]);
    const socket = useSocket();

    useEffect(() => {
        fetchData();
        if (!socket) return;

        socket.on('PERMISSION_UPDATE', () => fetchData());
        socket.on('SEAT_UPDATE', () => fetchData());

        return () => {
            socket.off('PERMISSION_UPDATE');
            socket.off('SEAT_UPDATE');
        };
    }, [roomId, socket]);

    const fetchData = () => {
        fetch(`/api/teacher/rooms/${roomId}/status`)
            .then(res => res.json())
            .then(setSeats);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'OCCUPIED': return 'bg-blue-100 border-blue-400 text-blue-900';
            case 'EMPTY': return 'bg-gray-50 border-gray-200 text-gray-300';
            case 'MOVEMENT': return 'bg-yellow-100 border-yellow-400 text-yellow-900';
            case 'OUTING': return 'bg-red-100 border-red-400 text-red-900';
            case 'EARLY_LEAVE': return 'bg-purple-100 border-purple-400 text-purple-900';
            default: return 'bg-gray-100 border-gray-300';
        }
    };

    return (
        <div className="relative border bg-white rounded-lg shadow-sm w-full h-[600px] overflow-auto">
            <TooltipProvider>
                {seats.map(seat => (
                    <Tooltip key={seat.id}>
                        <TooltipTrigger asChild>
                            <div
                                className={cn(
                                    "absolute w-12 h-12 flex items-center justify-center border font-bold text-sm rounded cursor-default transition-colors",
                                    getStatusStyle(seat.status)
                                )}
                                style={{ left: (seat.x || 0) * 60, top: (seat.y || 0) * 60 }}
                            >
                                {seat.label}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            {seat.student ? (
                                <div className="text-xs">
                                    <p className="font-bold">{seat.student.name}</p>
                                    <p>{seat.student.grade}-{seat.student.class}-{seat.student.number}</p>
                                    <p className="opacity-70">{seat.status}</p>
                                    {seat.permission && <p className="text-[10px] max-w-[150px]">{seat.permission.reason}</p>}
                                </div>
                            ) : "빈자리"}
                        </TooltipContent>
                    </Tooltip>
                ))}
            </TooltipProvider>
        </div>
    );
}
