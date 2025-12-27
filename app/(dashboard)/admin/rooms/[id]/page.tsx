'use client';
import { use } from 'react';
import { SeatEditor } from '@/components/seat-map/SeatEditor';

export default function RoomEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);

    return (
        <div className="p-6 h-[calc(100vh-60px)] flex flex-col">
            <h1 className="text-2xl font-bold mb-4">좌석 배치 편집</h1>
            <SeatEditor roomId={resolvedParams.id} />
        </div>
    )
}
