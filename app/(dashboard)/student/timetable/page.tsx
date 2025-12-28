import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { TimetableGrid } from '@/components/student/TimetableGrid';

export default async function TimetablePage() {
    const session = await auth();
    if (!session?.user) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user) redirect('/login');

    return (
        <div className="p-4 md:p-6 w-full max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">학급 시간표</h1>
                <p className="text-muted-foreground mt-1">
                    {user.grade}학년 {user.class}반 시간표입니다.
                </p>
            </div>

            <TimetableGrid grade={user.grade || 0} classNum={user.class || 0} />
        </div>
    );
}
