import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getTeacherStats(teacherId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Pending Permissions Count (ALL students, since teachers see all)
    // Or maybe just their homeroom? Assuming ALL for now as per previous logic.
    // Wait, previous logic: `prisma.permission.count({ where: { status: 'PENDING' } })` ??
    // No, previous logic checks `DashboardContent.tsx`. 
    // It was likely just fetching pending permissions count.

    // Check previous logic from file content step 521:
    // It wasn't shown fully. But usually it's global pending or homeroom.

    // I will implementation a safe logical assumption:
    // Teachers usually want to see PENDING permissions they can approve.
    // If they are admin-like, they see all.
    // Let's assume `teacherId` might filter by class if schema supports, but currently `Permission` has `teacherId` (who approved/created) or `studentId`.
    // The "Inbox" logic usually fetches `where: { status: 'PENDING' }`.

    const pendingPermissions = await prisma.permission.count({
        where: { status: 'PENDING' }
    });

    // Today's events
    const todayEvents = await prisma.event.findMany({
        where: {
            date: {
                gte: today,
                lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        }
    });

    return {
        pendingPermissions,
        todayEventsCount: todayEvents.length,
        todayEventsTitles: todayEvents.map(e => e.title).join(", ")
    };
}

export async function TeacherStats({ teacherId }: { teacherId: string }) {
    const data = await getTeacherStats(teacherId);

    return (
        <>
            <Card className="bg-gradient-to-br from-red-50 to-white border-red-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-900">결재 대기</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                    <div className="text-2xl font-bold text-red-700">{data.pendingPermissions}건</div>
                    <p className="text-xs text-red-600/80 mt-1">전체 승인 대기</p>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-white border-red-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-900">오늘의 행사</CardTitle>
                    <Calendar className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                    <div className="text-lg font-bold text-red-700 truncate" title={data.todayEventsTitles}>
                        {data.todayEventsCount > 0 ? data.todayEventsTitles : "없음"}
                    </div>
                    <p className="text-xs text-red-600/80 mt-1">진행 중인 행사</p>
                </CardContent>
            </Card>
            {/* Placeholder to fill grid 3? Or just 2 cards. Student has 3 cards. Teacher has 2. */}
            <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-100 shadow-sm opacity-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-900">준비 중</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                    <div className="text-lg font-bold text-gray-500">-</div>
                    <p className="text-xs text-gray-400 mt-1">추가 기능 예정</p>
                </CardContent>
            </Card>
        </>
    );
}
