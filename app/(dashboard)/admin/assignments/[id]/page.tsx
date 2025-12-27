'use client';
import { use, useState } from 'react';
import SeatAssigner from '@/components/seat-map/SeatAssigner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SeatExcelActions } from '@/components/admin/SeatExcelActions';

export default function RoomAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="p-6 h-[calc(100vh-60px)] flex flex-col">
            <div className="flex items-center gap-4 mb-4">
                <Link href="/admin/assignments">
                    <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
                </Link>
                <h1 className="text-2xl font-bold">학생 좌석 배정</h1>
            </div>
            <div className="flex justify-end mb-4">
                <SeatExcelActions roomId={resolvedParams.id} onSuccess={() => setRefreshKey(k => k + 1)} />
            </div>
            <SeatAssigner key={refreshKey} roomId={resolvedParams.id} />
        </div>
    );
}
