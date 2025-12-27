'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, UserPlus, UserMinus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSocket } from '@/components/providers/SocketProvider';
import { ExcelBulkAssign } from './ExcelBulkAssign';

interface Seat {
    id: string;
    label: string;
    x: number;
    y: number;
    status: string;
    student?: {
        id: string;
        name: string;
        grade: number;
        class: number;
        number: number;
    };
}

interface Student {
    id: string;
    name: string;
    grade: number;
    class: number;
    number: number;
}

export default function SeatAssigner({ roomId }: { roomId: string }) {
    const [seats, setSeats] = useState<Seat[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Student[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const socket = useSocket();

    useEffect(() => {
        fetchSeats();
    }, [roomId]);

    useEffect(() => {
        if (!socket) return;
        socket.on('SEAT_UPDATE', () => fetchSeats());
        return () => {
            socket.off('SEAT_UPDATE');
        };
    }, [socket]);

    const fetchSeats = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/teacher/rooms/${roomId}/status`);
            const data = await res.json();
            setSeats(data);
        } catch (e) {
            console.error("Failed to fetch seats", e);
        }
        setLoading(false);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`/api/admin/students/search?query=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            setSearchResults(data);
        } catch (e) {
            console.error("Search failed", e);
        }
        setIsSearching(false);
    };

    const handleAssign = async (studentId: string) => {
        if (!selectedSeat) return;
        setIsSubmitting(true);
        try {
            await fetch('/api/admin/seats/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seatId: selectedSeat.id,
                    studentId,
                    action: 'ASSIGN'
                })
            });
            await fetchSeats();
            setSelectedSeat(null);
        } catch (e) {
            console.error("Assignment failed", e);
        }
        setIsSubmitting(false);
    };

    const handleUnassign = async () => {
        if (!selectedSeat) return;
        setIsSubmitting(true);
        try {
            await fetch('/api/admin/seats/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seatId: selectedSeat.id,
                    action: 'UNASSIGN'
                })
            });
            await fetchSeats();
            setSelectedSeat(null);
        } catch (e) {
            console.error("Unassignment failed", e);
        }
        setIsSubmitting(false);
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-gray-400" /></div>;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end">
                <ExcelBulkAssign roomId={roomId} onUpdate={fetchSeats} />
            </div>
            <div className="border bg-gray-50 relative overflow-auto h-[600px] rounded-lg shadow-inner p-4">
                {seats.map(seat => (
                    <div
                        key={seat.id}
                        className={`absolute w-12 h-12 flex flex-col items-center justify-center rounded-md border text-[10px] cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm
                            ${seat.status === 'MOVEMENT' ? 'bg-yellow-100 border-yellow-400 text-yellow-800' :
                                seat.status === 'OUTING' ? 'bg-orange-100 border-orange-400 text-orange-800' :
                                    seat.student ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-white border-gray-300'}
                        `}
                        style={{ left: (seat.x || 0) * 60, top: (seat.y || 0) * 60 }}
                        onClick={() => {
                            setSelectedSeat(seat);
                            setSearchQuery('');
                            setSearchResults([]);
                        }}
                    >
                        <div className="flex flex-col items-center justify-center w-full h-full overflow-hidden">
                            <span className="font-bold shrink-0">{seat.label}</span>
                            {seat.student && (
                                <span className="truncate w-full text-center px-0.5 font-medium leading-tight">
                                    {seat.student.name}
                                    {seat.status === 'MOVEMENT' && <span className="block text-[8px] text-yellow-700">이동</span>}
                                    {seat.status === 'OUTING' && <span className="block text-[8px] text-orange-700">외출</span>}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={!!selectedSeat} onOpenChange={() => setSelectedSeat(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>좌석 배정: {selectedSeat?.label}</DialogTitle>
                        <DialogDescription>
                            이 좌석에 학생을 배정하거나 배정을 해제합니다.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSeat?.student ? (
                        <div className="py-4 space-y-4">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-blue-700">{selectedSeat.student.name}</p>
                                    <p className="text-sm text-blue-600">
                                        {selectedSeat.student.grade}학년 {selectedSeat.student.class}반 {selectedSeat.student.number}번
                                    </p>
                                </div>
                                <Button variant="destructive" size="sm" onClick={handleUnassign} disabled={isSubmitting}>
                                    <UserMinus className="w-4 h-4 mr-2" />
                                    배정 해제
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-4 space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="학생 이름 또는 아이디 검색"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                />
                                <Button onClick={handleSearch} disabled={isSearching}>
                                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                </Button>
                            </div>

                            <ScrollArea className="h-60 rounded-md border p-2">
                                {searchResults.length === 0 && searchQuery && !isSearching && (
                                    <p className="text-center text-sm text-gray-500 py-4">검색 결과가 없습니다.</p>
                                )}
                                <div className="space-y-2">
                                    {searchResults.map(student => (
                                        <div
                                            key={student.id}
                                            className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md border text-sm cursor-pointer group"
                                            onClick={() => handleAssign(student.id)}
                                        >
                                            <div>
                                                <span className="font-medium group-hover:text-blue-600 transition-colors">{student.name}</span>
                                                <span className="ml-2 text-xs text-gray-500">
                                                    ({student.grade}-{student.class}-{student.number})
                                                </span>
                                            </div>
                                            <Button size="sm" variant="ghost" className="group-hover:bg-blue-50 group-hover:text-blue-600" disabled={isSubmitting}>
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                배정
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setSelectedSeat(null)}>닫기</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
