'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, UserPlus, UserMinus, ZoomIn, ZoomOut } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';


interface Seat {
    id: string;
    label: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    type?: string;
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
    const [scale, setScale] = useState(1);

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        fetchSeats(); // Initial fetch
        const interval = setInterval(() => fetchSeats(true), 5000); // Poll every 5 seconds for seats (background)
        return () => clearInterval(interval);
    }, []);

    const fetchSeats = async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            const res = await fetch(`/api/teacher/rooms/${roomId}/status`, { cache: 'no-store' });
            const data = await res.json();
            setSeats(data);
        } catch (e) {
            console.error("Failed to fetch seats", e);
        }
        if (!isBackground) setLoading(false);
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

    const handleAssign = async (studentId: string, studentData: Student) => {
        if (!selectedSeat) return;

        // Optimistic Update
        const previousSeats = [...seats];
        setSeats(prev => prev.map(s => s.id === selectedSeat.id ? { ...s, student: { ...studentData, id: studentId } } : s));

        // Close Dialog immediately for speed
        setSelectedSeat(null);
        setSearchQuery('');
        setSearchResults([]);

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
            await fetchSeats(true); // Background refresh
        } catch (e) {
            console.error("Assignment failed", e);
            setSeats(previousSeats); // Revert on error
            toast.error("배정에 실패했습니다.");
        }
    };

    const handleUnassign = async () => {
        if (!selectedSeat) return;

        // Optimistic
        const previousSeats = [...seats];
        setSeats(prev => prev.map(s => s.id === selectedSeat.id ? { ...s, student: undefined } : s));
        setSelectedSeat(null);

        try {
            await fetch('/api/admin/seats/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seatId: selectedSeat.id,
                    action: 'UNASSIGN'
                })
            });
            await fetchSeats(true);
        } catch (e) {
            console.error("Unassignment failed", e);
            setSeats(previousSeats);
            toast.error("배정 해제 실패");
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-gray-400" /></div>;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end gap-2 mb-2">
                <Button variant="outline" size="sm" onClick={() => setScale(s => Math.max(0.2, s - 0.1))}><ZoomOut className="w-4 h-4" /></Button>
                <span className="flex items-center text-sm">{Math.round(scale * 100)}%</span>
                <Button variant="outline" size="sm" onClick={() => setScale(s => Math.min(2, s + 0.1))}><ZoomIn className="w-4 h-4" /></Button>
            </div>

            <div className="border bg-gray-50 relative overflow-auto h-[600px] rounded-lg shadow-inner p-4">
                <div
                    className="relative transition-all origin-top-left"
                    style={{
                        width: `${2000 * scale}px`, // Large area
                        height: `${2000 * scale}px`
                    }}
                >
                    {seats.map(seat => {
                        const isSeat = seat.type === 'SEAT' || !seat.type; // Default to SEAT if undefined
                        const width = (seat.width || 1) * 60; // Increased base size to 60px
                        const height = (seat.height || 1) * 60;
                        const left = (seat.x || 0) * 60;
                        const top = (seat.y || 0) * 60;

                        if (!isSeat) {
                            // Render non-seat items
                            return (
                                <div
                                    key={seat.id}
                                    className={cn(
                                        "absolute flex items-center justify-center text-xs select-none font-bold",
                                        seat.type === 'WALL' ? "bg-gray-800 border-2 border-gray-900 z-0" : "z-10",
                                        seat.type === 'WINDOW' && "bg-blue-100 border border-blue-300 text-blue-600 rounded-sm",
                                        seat.type === 'DOOR' && "bg-amber-100 border border-amber-300 text-amber-700 rounded-sm",
                                        seat.type === 'PILLAR' && "bg-stone-300 border border-stone-400 text-stone-700 rounded-sm"
                                    )}
                                    style={{
                                        left: left * scale,
                                        top: top * scale,
                                        width: width * scale,
                                        height: height * scale,
                                        fontSize: `${12 * scale}px`
                                    }}
                                >
                                    {seat.type === 'WINDOW' && "창문"}
                                    {seat.type === 'DOOR' && "문"}
                                    {seat.type === 'PILLAR' && "기둥"}
                                </div>
                            );
                        }

                        // Render Seat
                        return (
                            <div
                                key={seat.id}
                                className={`absolute flex flex-col items-center justify-center rounded-md border text-[10px] cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm z-10
                                    ${seat.status === 'MOVEMENT' ? 'bg-red-100 border-red-400 text-red-800' :
                                        seat.status === 'OUTING' ? 'bg-red-100 border-red-400 text-red-800' :
                                            seat.student ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-white border-gray-300'}
                                `}
                                style={{
                                    left: left * scale,
                                    top: top * scale,
                                    width: width * scale,
                                    height: height * scale
                                }}
                                onClick={() => {
                                    setSelectedSeat(seat);
                                    setSearchQuery('');
                                    setSearchResults([]);
                                }}
                            >
                                <div className="flex flex-col items-center justify-center w-full h-full overflow-hidden p-1">
                                    <span className="font-bold shrink-0" style={{ fontSize: `${14 * scale}px` }}>{seat.label}</span>
                                    {seat.student && (
                                        <span className="truncate w-full text-center px-0.5 font-medium leading-tight" style={{ fontSize: `${12 * scale}px` }}>
                                            {seat.student.name}
                                            {seat.status === 'MOVEMENT' && <span className="block text-[8px] text-yellow-700">이동</span>}
                                            {seat.status === 'OUTING' && <span className="block text-[8px] text-orange-700">외출</span>}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
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
                                <Button variant="destructive" size="sm" onClick={handleUnassign}>
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
                                    autoFocus
                                />
                                <Button disabled={isSearching}>
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
                                            onClick={() => handleAssign(student.id, student)}
                                        >
                                            <div>
                                                <span className="font-medium group-hover:text-blue-600 transition-colors">{student.name}</span>
                                                <span className="ml-2 text-xs text-gray-500">
                                                    ({student.grade}-{student.class}-{student.number})
                                                </span>
                                            </div>
                                            <Button size="sm" variant="ghost" className="group-hover:bg-blue-50 group-hover:text-blue-600">
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
        </div >
    );
}
