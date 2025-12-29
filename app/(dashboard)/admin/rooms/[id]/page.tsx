'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { SeatEditor } from '@/components/seat-map/SeatEditor';

export default function RoomEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();

    return (
        <div className="p-6 h-[calc(100vh-60px)] flex flex-col">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="outline" size="icon" onClick={() => router.push('/admin/rooms')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">좌석 배치 편집</h1>
            </div>
            <SeatEditor roomId={resolvedParams.id} />
        </div>
    )
}
