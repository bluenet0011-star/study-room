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
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">자습실 모니터링</h1>
                <p className="text-muted-foreground mt-1">각 자습실의 실시간 좌석 현황을 확인합니다.</p>
            </div>
            {rooms.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🪑</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">등록된 자습실이 없습니다</h3>
                    <p className="text-gray-500 mt-2">관리자가 자습실을 생성할 때까지 기다려주세요.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rooms.map(room => (
                        <Link href={`/teacher/seats/${room.id}`} key={room.id}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-t-primary/20 hover:border-t-primary">
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-center">
                                        <span>{room.name}</span>
                                        <span className="text-xs font-normal bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                                            {room.grade ? `${room.grade}학년` : '전체'}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <span className="mr-2">총 좌석:</span>
                                        <span className="font-bold text-gray-900">{room.seats?.length || 0}석</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
