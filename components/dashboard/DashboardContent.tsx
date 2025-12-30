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

    // Active Permission
    const permissions = await prisma.permission.findMany({
        where: {
            studentId,
            status: { in: ['PENDING', 'APPROVED'] },
            start: { gte: new Date() } // Future permissions
        },
        orderBy: { start: 'asc' },
        take: 2
    });

    return {
        seat: assignment ? `${assignment.seat.room.name} ${assignment.seat.label}` : '미배정',
        permissions
    };
}

async function getTeacherStats() {
    // Pending Permissions
    const pendingPermissions = await prisma.permission.count({
        where: { status: 'PENDING' }
    });

    // Check-in (rough estimate via active seat assignments or just events)
    const todayEvents = await prisma.event.count({
        where: {
            date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
        }
    });

    return { pendingPermissions, todayEvents };
}

export default async function DashboardContent() {
    const session = await auth();
    if (!session?.user) return null;

    const role = session.user.role;
    const notices = await getRecentNotices();

    let studentData = null;
    let teacherData = null;

    if (role === 'STUDENT') {
        studentData = await getStudentStats(session.user.id);
    } else if (role === 'TEACHER' || role === 'ADMIN') {
        teacherData = await getTeacherStats();
    }

    // Filter links
    const filteredLinks = NAV_LINKS.filter((link) =>
        link.roles.includes(role) && link.href !== '/'
    );

    const roleNames: Record<string, string> = {
        ADMIN: "관리자",
        TEACHER: "선생님",
        STUDENT: "학생",
    };

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        {roleNames[role]} 대시보드
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        안녕하세요, <span className="font-semibold text-primary">{session.user.name}</span>님. 오늘도 즐거운 하루 되세요!
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="px-3 py-1 text-sm bg-white shadow-sm">
                        {new Date().toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Badge>
                </div>
            </div>

            {/* Widgets Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Role Specific Stats */}
                {role === 'STUDENT' && studentData && (
                    <>
                        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-blue-900">내 좌석</CardTitle>
                                <MapPin className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-700">{studentData.seat}</div>
                                <p className="text-xs text-blue-600/80 mt-1">현재 배정된 학습 공간</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-purple-900">다음 일정</CardTitle>
                                <Calendar className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                {studentData.permissions.length > 0 ? (
                                    <>
                                        <div className="text-lg font-bold text-purple-700 truncate">
                                            {studentData.permissions[0].type === 'MOVEMENT' ? '이동' : '외출'} 신청
                                        </div>
                                        <p className="text-xs text-purple-600/80 mt-1">
                                            {new Date(studentData.permissions[0].start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 시작
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-lg font-bold text-purple-700">일정 없음</div>
                                        <p className="text-xs text-purple-600/80 mt-1">예정된 퍼미션이 없습니다.</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Teacher Stats */}
                {(role === 'TEACHER' || role === 'ADMIN') && teacherData && (
                    <>
                        <Card className="bg-gradient-to-br from-red-50 to-white border-red-100 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-red-900">결재 대기</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-700">{teacherData.pendingPermissions}건</div>
                                <p className="text-xs text-red-600/80 mt-1">승인이 필요한 퍼미션</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-green-900">오늘의 행사</CardTitle>
                                <Calendar className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-700">{teacherData.todayEvents}개</div>
                                <p className="text-xs text-green-600/80 mt-1">진행 중인 QR 행사</p>
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Notices Widget (Spans 2 cols on large, or full width) */}
                <Card className="col-span-1 md:col-span-2 shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Megaphone className="w-4 h-4 text-orange-500" />
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
            </div>

            {/* Quick Links Grid */}
            <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-800">바로가기</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="group">
                            <Card className="h-full hover:border-blue-500/50 hover:shadow-md transition-all duration-300">
                                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                                    <div className="p-3 rounded-full bg-gray-50 group-hover:bg-blue-50 transition-colors">
                                        <link.icon className="h-6 w-6 text-gray-500 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">{link.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{link.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
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
