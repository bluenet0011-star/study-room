import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NAV_LINKS } from "@/config/nav";
import { Badge } from "@/components/ui/badge";
import {
    Bell,
    Calendar,
    CheckCircle2,
    Clock,
    Megaphone,
    User
} from "lucide-react";

async function getRecentNotices() {
    return await prisma.notice.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, createdAt: true, important: true }
    });
}

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
            // Overlap condition: Start < TodayEnd AND End > TodayStart
            start: { lt: todayEnd },
            end: { gt: todayStart }
        },
        orderBy: { start: 'asc' }
    });

    // Calculate Counts
    const pendingCount = todayPermissions.filter(p => p.status === 'PENDING').length;
    const approvedCount = todayPermissions.filter(p => p.status === 'APPROVED').length;

    // Find Next/Active Permission (End > Now). 
    // Since we ordered by 'start: asc', this will pick the current one (if active) or the immediate next one.
    const nextPermission = todayPermissions.find(p => new Date(p.end) > now);

    return {
        seat: assignment ? `${assignment.seat.room.name} ${assignment.seat.label}` : '미배정',
        todayPermissions,
        counts: {
            pending: pendingCount,
            approved: approvedCount
        },
        nextPermission
    };
}
// ...
// Update Usage in Component
// ...
{/* Role Specific Stats */ }
{
    role === 'STUDENT' && studentData && (
        <>
            <Card className="bg-gradient-to-br from-red-50 to-white border-red-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-900">내 퍼미션</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                    <div className="text-2xl font-bold text-red-700">
                        {studentData.counts.pending} / {studentData.counts.approved}
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
                    {studentData.nextPermission ? (
                        <>
                            <div className="text-lg font-bold text-red-700 truncate">
                                {new Date(studentData.nextPermission.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ~ {new Date(studentData.nextPermission.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <p className="text-xs text-red-600/80 mt-1">
                                {studentData.nextPermission.type === 'MOVEMENT' ? '이동' : '외출'} 승인됨
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="text-lg font-bold text-red-700">일정 없음</div>
                            <p className="text-xs text-red-600/80 mt-1">남은 일정이 없습니다.</p>
                        </>
                    )}
                </CardContent>
            </Card>
        </>
    )
}

{/* Teacher Stats */ }
{
    role === 'TEACHER' && teacherData && (
        <>
            <Card className="bg-gradient-to-br from-red-50 to-white border-red-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-900">결재 대기</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                    <div className="text-2xl font-bold text-red-700">{teacherData.pendingPermissions}건</div>
                    <p className="text-xs text-red-600/80 mt-1">우리 반 승인 대기</p>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-white border-red-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-900">오늘의 행사</CardTitle>
                    <Calendar className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                    <div className="text-lg font-bold text-red-700 truncate" title={teacherData.todayEventsTitles}>
                        {teacherData.todayEventsCount > 0 ? teacherData.todayEventsTitles : "없음"}
                    </div>
                    <p className="text-xs text-red-600/80 mt-1">진행 중인 행사</p>
                </CardContent>
            </Card>
        </>
    )
}

{/* Notices Widget (Spans 2 cols on large, or full width) */ }
<Card className="col-span-2 md:col-span-2 shadow-sm">
    <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-red-500" />
                최신 공지사항
            </CardTitle>
            <Link href="/notice" className="text-xs text-gray-500 hover:text-primary">더보기 &rarr;</Link>
        </div>
    </CardHeader>
    <CardContent>
        <div className="space-y-3">
            {notices.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">등록된 공지사항이 없습니다.</p>
            ) : (
                notices.map(notice => (
                    <Link href={`/notice/${notice.id}`} key={notice.id} className="block group">
                        <div className="flex justify-between items-start">
                            <span className={`text-sm group-hover:underline ${notice.important ? 'font-bold text-red-600' : 'text-gray-700'}`}>
                                {notice.important && <span className="text-red-500 mr-1">[필독]</span>}
                                {notice.title}
                            </span>
                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                {new Date(notice.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </Link>
                ))
            )}
        </div>
    </CardContent>
</Card>
            </div >

    {/* Quick Links Grid */ }
    < div >
                <h2 className="text-lg font-semibold mb-4 text-gray-800">바로가기</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {filteredLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="group">
                            <Card className="h-full hover:border-red-500/50 hover:shadow-md transition-all duration-300">
                                <CardContent className="p-3 md:p-6 flex flex-col items-center text-center space-y-2 md:space-y-3">
                                    <div className="p-2 md:p-3 rounded-full bg-gray-50 group-hover:bg-red-50 transition-colors">
                                        <link.icon className="h-5 w-5 md:h-6 md:w-6 text-red-500 group-hover:text-red-600 transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm md:text-base font-semibold text-gray-900 group-hover:text-red-700">{link.name}</h3>
                                        <p className="text-[10px] md:text-xs text-gray-500 mt-1 line-clamp-1 md:line-clamp-2">{link.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div >
        </div >
    );
}

function MapPin(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    )
}
