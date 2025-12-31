import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { NAV_LINKS } from "@/config/nav";
import { Suspense } from "react";
import { StudentStats, StatsSkeleton } from "@/components/dashboard/widgets/StudentStats";
import { TeacherStats } from "@/components/dashboard/widgets/TeacherStats"; // Reuse StatsSkeleton?
import { NoticesWidget, NoticesSkeleton } from "@/components/dashboard/widgets/NoticesWidget";
import { TimetableWidget } from "@/components/dashboard/widgets/TimetableWidget";
import { prisma } from "@/lib/prisma";

export default async function DashboardContent() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const { role } = session.user;

    let userGrade = 0;
    let userClass = 0;
    if (role === 'STUDENT') {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { grade: true, class: true }
        });
        userGrade = user?.grade || 0;
        userClass = user?.class || 0;
    }

    const filteredLinks = NAV_LINKS.filter(link => link.roles.includes(role));

    // Stats Widget Selector
    const StatsSection = () => {
        if (role === 'STUDENT') {
            return (
                <Suspense fallback={<StatsSkeleton />}>
                    <StudentStats studentId={session.user.id} />
                </Suspense>
            );
        }
        if (role === 'TEACHER' || role === 'ADMIN') {
            return (
                <Suspense fallback={<StatsSkeleton />}>
                    <TeacherStats teacherId={session.user.id} />
                </Suspense>
            );
        }
        return null;
    };

    const today = new Date();
    const dateString = today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto pb-24">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                        안녕하세요, {session.user.name}님!
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">
                        {dateString} ・ 오늘도 즐거운 하루 되세요.
                    </p>
                </div>
                <div className="px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-sm font-semibold border border-red-100 shadow-sm animate-pulse">
                    {role === 'STUDENT' ? '학생' : (role === 'TEACHER' ? '선생님' : '관리자')}
                </div>
            </div>

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Dynamic Stats (Streamed) */}
                {/* Dynamic Stats (Streamed) */}
                <StatsSection />

                {/* Timetable Widget (Student Only) */}
                {role === 'STUDENT' && (
                    <TimetableWidget grade={userGrade} classNum={userClass} />
                )}

                {/* Notices (Streamed) */}
                <Suspense fallback={<NoticesSkeleton />}>
                    <NoticesWidget />
                </Suspense>
            </div>

            {/* Quick Links Grid */}
            <div>
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
            </div>
        </div>
    );
}
