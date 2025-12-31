import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { TimetableGrid } from '@/components/student/TimetableGrid';

export const dynamic = 'force-dynamic';

export default async function TimetablePage() {
    let user;
    try {
        const session = await auth();
        if (!session?.user) redirect('/login');

        user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

    } catch (error) {
        // Re-throw redirect errors so Next.js handles them
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }
        // Check for internal Next.js Digest property for redirects (sometimes needed)
        if (typeof error === 'object' && error !== null && 'digest' in error && (error as any).digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }

        console.error("TimetablePage Error:", error);
        return (
            <div className="p-10 text-center">
                <h2 className="text-xl font-bold mb-2">시간표를 불러오는 중 오류가 발생했습니다.</h2>
                <p className="text-gray-500">잠시 후 다시 시도해주세요.</p>
            </div>
        );
    }

    if (!user) redirect('/login');

    return (
        <div className="p-4 md:p-6 w-full max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">주간 시간표</h1>
                <p className="text-muted-foreground mt-1">
                    {user.grade}학년 {user.class}반 시간표입니다.
                </p>
            </div>

            <TimetableGrid grade={user.grade || 0} classNum={user.class || 0} />
        </div>
    );
}
