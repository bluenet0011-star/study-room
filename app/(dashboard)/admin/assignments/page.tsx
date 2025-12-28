'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { DoorOpen, Users } from 'lucide-react';

interface Room {
    id: string;
    name: string;
    grade: number | null;
    _count: { seats: number };
}

export default function AssignmentRoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);

    useEffect(() => {
        fetch('/api/admin/rooms').then(res => res.json()).then(setRooms);
    }, []);

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-3xl font-bold mb-6">학생 좌석 배정</h1>
            <p className="text-gray-600 mb-8">좌석을 배정할 자습실을 선택하세요.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map(room => (
                    <Link href={`/admin/assignments/${room.id}`} key={room.id}>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <DoorOpen className="w-6 h-6 text-blue-500" />
                                    <CardTitle>{room.name}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>학년: {room.grade || '전체'}</span>
                                    <span>좌석수: {room._count?.seats || 0}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
