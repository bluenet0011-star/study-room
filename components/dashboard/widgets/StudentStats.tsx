import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getStudentStats(studentId: string) {
    // Current Seat
    const assignment = await prisma.seatAssignment.findFirst({
        where: { userId: studentId, active: true, endDate: null },
        include: { seat: { include: { room: true } } }
    });

    // Active Permission (Today Only)
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // Fetch ALL permissions for today (overlapping today)
    const todayPermissions = await prisma.permission.findMany({
        where: {
            studentId,
            status: { in: ['PENDING', 'APPROVED'] },
            start: { lt: todayEnd },
            end: { gt: todayStart }
        },
        orderBy: { start: 'asc' }
    });

    // Calculate Counts
    const pendingCount = todayPermissions.filter(p => p.status === 'PENDING').length;
    const approvedCount = todayPermissions.filter(p => p.status === 'APPROVED').length;

    // Find Next/Active Permission (End > Now) AND APPROVED. 
    const nextPermission = todayPermissions.find(p => new Date(p.end) > now && p.status === 'APPROVED');

    return {
        seat: assignment ? `${assignment.seat.room.name} ${assignment.seat.label}` : '미배정',
        todayPermissions, // Not used but fetched
        counts: {
            pending: pendingCount,
            approved: approvedCount
        },
        nextPermission
    };
}

export async function StudentStats({ studentId }: { studentId: string }) {
    const data = await getStudentStats(studentId);

    return (
        <>
            <Card className="bg-gradient-to-br from-red-50 to-white border-red-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-900">내 자습석</CardTitle>
                    <div className="h-4 w-4 text-red-500 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">
                        S
                    </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                    <div className="text-lg md:text-2xl font-bold text-red-700 truncate">{data.seat}</div>
                    <p className="text-xs text-red-600/80 mt-1">현재 이용 중인 좌석</p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-white border-red-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-900">내 퍼미션</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                    <div className="text-lg md:text-2xl font-bold text-red-700">
                        {data.counts.pending} / {data.counts.approved}
                    </div>
                    <p className="text-xs text-red-600/80 mt-1">대기 / 승인 (오늘)</p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-white border-red-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-900">다음 일정</CardTitle>
                    <Clock className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                    {data.nextPermission ? (
                        <>
                            <div className="text-base md:text-lg font-bold text-red-700 truncate">
                                {new Date(data.nextPermission.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ~ {new Date(data.nextPermission.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <p className="text-xs text-red-600/80 mt-1 truncate">
                                {data.nextPermission.type === 'MOVEMENT' ? '이동' : '외출'} 승인됨
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="text-base md:text-lg font-bold text-red-700">일정 없음</div>
                            <p className="text-xs text-red-600/80 mt-1">남은 일정이 없습니다.</p>
                        </>
                    )}
                </CardContent>
            </Card>
        </>
    );
}

export function StatsSkeleton() {
    return (
        <>
            {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse bg-gray-50 border-gray-100">
                    <CardHeader className="pb-2">
                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-8 w-3/4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                    </CardContent>
                </Card>
            ))}
        </>
    )
}
