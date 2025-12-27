'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Room {
    id: string;
    name: string;
    grade: number | null;
    seats: any[];
}

export default function SeatRoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);

    useEffect(() => {
        // Re-use admin API for listing (add logic to API to allow teacher if needed, or create teacher specific one)
        // For now, assuming teachers can view all rooms.
        // Let's create a teacher-accessible endpoint or check if admin endpoint allows it.
        // Checking /app/api/admin/rooms/route.ts -> It checks role === "ADMIN".
        // I need to update the API to allow Teachers or create new one.
        // I'll update the Admin API to allow GET for Teachers.
        fetch('/api/admin/rooms').then(res => res.json()).then(setRooms).catch(() => { });
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">자습실 모니터링</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map(room => (
                    <Link href={`/teacher/seats/${room.id}`} key={room.id}>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader>
                                <CardTitle>{room.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500">학년: {room.grade || '전체'}</p>
                                <p className="text-sm text-gray-500">좌석수: {room.seats?.length || 0}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
