'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User, FileText, Clock, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Seat {
    id: string;
    label: string;
    x: number;
    y: number;
    status: string; // MOVEMENT, OUTING, OCCUPIED, EMPTY
    student?: {
        id: string;
        name: string;
        grade: number;
        class: number;
        number: number;
    };
    assignments: any[];
}

interface TeacherSeatMapProps {
    roomId: string;
}

const typeMap: Record<string, string> = {
    MOVEMENT: '이동',
    OUTING: '외출',
    EARLY_LEAVE: '조퇴',
    OTHER: '기타'
};

const statusMap: Record<string, string> = {
    PENDING: '대기중',
    APPROVED: '승인됨',
    REJECTED: '반려됨'
};

const SeatComponent = memo(({ seat, onClick, guidanceMode }: { seat: Seat, onClick: (s: Seat) => void, guidanceMode: boolean }) => {
    const isAssigned = !!seat.student;

    // Determine seat color based on status
    let seatColorClass = "bg-white border-gray-200 text-gray-400 hover:border-blue-400";
    if (isAssigned) {
        if (seat.status === 'MOVEMENT' || seat.status === 'OUTING') {
            seatColorClass = "bg-red-100 border-red-400 text-red-800 font-medium";
        } else {
            seatColorClass = "bg-blue-50 border-blue-200 text-blue-900 font-medium";
        }
    }

    return (
        <div
            onClick={() => onClick(seat)}
            className={cn(
                "absolute w-16 h-12 rounded-lg border text-xs flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm z-10",
                seatColorClass,
                guidanceMode && isAssigned && "ring-2 ring-red-400 ring-offset-1"
            )}
            style={{ left: seat.x * 60, top: seat.y * 60 }}
        >
            <span className="text-[10px] opacity-70 mb-0.5">{seat.label}</span>
            {isAssigned ? (
                <span className="truncate w-full text-center px-1 font-bold">
                    {seat.student?.name}
                    {(seat.status === 'MOVEMENT' || seat.status === 'OUTING') && (
                        <span className="block text-[8px] font-normal">{typeMap[seat.status] || seat.status}</span>
                    )}
                </span>
            ) : (
                <span className="text-[10px]">-</span>
            )}
        </div>
    );
}, (prev, next) => {
    return prev.seat.id === next.seat.id &&
        prev.seat.status === next.seat.status &&
        prev.seat.student?.id === next.seat.student?.id &&
        prev.guidanceMode === next.guidanceMode &&
        prev.seat.x === next.seat.x &&
        prev.seat.y === next.seat.y;
});

SeatComponent.displayName = 'SeatComponent';

export default function TeacherSeatMap({ roomId }: TeacherSeatMapProps) {
    const [seats, setSeats] = useState<Seat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
    const [guidanceMode, setGuidanceMode] = useState(false);
    const [permissions, setPermissions] = useState<any[]>([]); // Student permissions
    const [loadingPerms, setLoadingPerms] = useState(false);

    const fetchSeats = useCallback(async (isBackground = false) => {
        if (!isBackground) setIsLoading(true);
        try {
            const res = await fetch(`/api/teacher/rooms/${roomId}/status`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setSeats(data);
            }
        } catch (error) {
            console.error("Failed to fetch seats", error);
        } finally {
            if (!isBackground) setIsLoading(false);
        }
    }, [roomId]);

    useEffect(() => {
        fetchSeats();
        const interval = setInterval(() => fetchSeats(true), 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [fetchSeats]);

    const handleSeatClick = useCallback(async (seat: Seat) => {
        setSelectedSeat(seat);
        if (seat.student) {
            setLoadingPerms(true);
            try {
                const studentId = seat.student.id;
                const res = await fetch(`/api/student/permissions?studentId=${studentId}`);
                if (res.ok) setPermissions(await res.json());
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingPerms(false);
            }
        } else {
            setPermissions([]);
        }
    }, []);

    const student = selectedSeat?.student;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-4">
                    <h2 className="font-semibold text-lg">좌석 현황</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="flex items-center"><div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-1"></div> 배정됨</span>
                        <span className="flex items-center"><div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-1"></div> 부재중</span>
                        <span className="flex items-center"><div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-1"></div> 빈좌석</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={guidanceMode ? "destructive" : "outline"}
                        onClick={() => setGuidanceMode(!guidanceMode)}
                    >
                        {guidanceMode ? "지도모드 종료" : "지도모드 시작"}
                    </Button>
                </div>
            </div>

            <div className="relative border bg-white rounded-xl shadow-sm overflow-hidden h-[600px] w-full overflow-auto bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="text-sm text-gray-500">좌석 정보를 불러오는 중...</p>
                        </div>
                    </div>
                ) : (
                    seats.map((seat) => (
                        <SeatComponent
                            key={seat.id}
                            seat={seat}
                            onClick={handleSeatClick}
                            guidanceMode={guidanceMode}
                        />
                    ))
                )}
            </div>

            <Dialog open={!!selectedSeat} onOpenChange={(o) => !o && setSelectedSeat(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedSeat?.label}번 좌석 정보</DialogTitle>
                    </DialogHeader>

                    {student ? (
                        <Tabs defaultValue="student" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="status">상태관리</TabsTrigger>
                                <TabsTrigger value="student">학생정보</TabsTrigger>
                                <TabsTrigger value="permission">신청내역</TabsTrigger>
                            </TabsList>

                            <TabsContent value="status" className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-green-50 hover:border-green-200">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <Check className="w-5 h-5" />
                                        </div>
                                        <span>확인됨</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-red-50 hover:border-red-200">
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <AlertCircle className="w-5 h-5" />
                                        </div>
                                        <span>자리에 없음</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-yellow-50 hover:border-yellow-200">
                                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <span>지도 중</span>
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="student" className="space-y-4 py-4">
                                <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                                        🎓
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{student.name}</h3>
                                        <p className="text-gray-600">{student.grade}학년 {student.class}반 {student.number}번</p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="permission" className="space-y-4 py-4">
                                {loadingPerms ? (
                                    <p className="text-center text-gray-500 py-4">로딩 중...</p>
                                ) : permissions.length > 0 ? (
                                    <div className="space-y-2">
                                        {permissions.map((perm: any) => (
                                            <div key={perm.id} className="p-3 border rounded-lg text-sm bg-white">
                                                <div className="flex justify-between mb-1">
                                                    <Badge variant={perm.status === 'APPROVED' ? 'default' : 'secondary'}>
                                                        {statusMap[perm.status] || perm.status}
                                                    </Badge>
                                                    <span className="text-gray-500 text-xs">
                                                        {format(new Date(perm.createdAt), 'MM/dd HH:mm')}
                                                    </span>
                                                </div>
                                                <p className="font-medium text-gray-900">{typeMap[perm.type] || perm.type} - {perm.location}</p>
                                                <p className="text-gray-500 mt-1">{perm.reason}</p>
                                                <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                                    {format(new Date(perm.start), 'HH:mm')} ~ {format(new Date(perm.end), 'HH:mm')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">진행 중인 퍼미션이 없습니다.</p>
                                )}
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <div className="py-8 text-center text-gray-500">
                            배정된 학생이 없는 좌석입니다.
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
