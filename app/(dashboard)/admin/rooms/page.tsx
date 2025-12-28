'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

interface Room {
    id: string;
    name: string;
    grade: number | null;
    seats: any[];
}

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomGrade, setNewRoomGrade] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = () => fetch('/api/admin/rooms').then(res => res.json()).then(setRooms);

    const handleCreate = async () => {
        if (!newRoomName) return;
        setLoading(true);
        await fetch('/api/admin/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newRoomName, grade: newRoomGrade })
        });
        setNewRoomName('');
        setNewRoomGrade('');
        setLoading(false);
        fetchRooms();
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">자습실 관리</h1>
                <p className="text-muted-foreground mt-1">자습실을 생성하고 좌석 배치를 설정합니다.</p>
            </div>

            <Card className="mb-6">
                <CardHeader><CardTitle>새 자습실 생성</CardTitle></CardHeader>
                <CardContent className="flex gap-4 items-end">
                    <div className="space-y-2">
                        <Label>자습실 이름</Label>
                        <Input value={newRoomName} onChange={e => setNewRoomName(e.target.value)} placeholder="예: 자습실 A" />
                    </div>
                    <div className="space-y-2 w-24">
                        <Label>학년</Label>
                        <Input value={newRoomGrade} onChange={e => setNewRoomGrade(e.target.value)} placeholder="1" type="number" />
                    </div>
                    <Button onClick={handleCreate} disabled={loading}>생성</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>기존 자습실</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {rooms.map(room => (
                            <Card key={room.id} className="shadow-sm border">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{room.name}</h3>
                                            <p className="text-sm text-gray-500">{room.grade ? `${room.grade}학년` : '전체 학년'}</p>
                                        </div>
                                        <div className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 font-medium">
                                            좌석 {room.seats?.length || 0}개
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4 pt-3 border-t">
                                        <Link href={`/admin/rooms/${room.id}`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full">
                                                좌석 배치
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="flex-1"
                                            onClick={async () => {
                                                if (!confirm('자습실을 삭제하시겠습니까?')) return;
                                                await fetch(`/api/admin/rooms/${room.id}`, { method: 'DELETE' });
                                                fetchRooms();
                                            }}
                                        >
                                            삭제
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <Table className="hidden md:table">
                        <TableHeader>
                            <TableRow>
                                <TableHead>이름</TableHead>
                                <TableHead>학년</TableHead>
                                <TableHead>좌석수</TableHead>
                                <TableHead>작업</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rooms.map(room => (
                                <TableRow key={room.id}>
                                    <TableCell>{room.name}</TableCell>
                                    <TableCell>{room.grade || '전체'}</TableCell>
                                    <TableCell>{room.seats?.length || 0}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Link href={`/admin/rooms/${room.id}`}>
                                                <Button variant="outline" size="sm">좌석 배치 편집</Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={async () => {
                                                    if (!confirm('자습실을 삭제하시겠습니까?')) return;
                                                    await fetch(`/api/admin/rooms/${room.id}`, { method: 'DELETE' });
                                                    fetchRooms();
                                                }}
                                            >
                                                삭제
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
