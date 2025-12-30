
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const suggestion = await prisma.suggestion.findUnique({
            where: { id }
        });

        if (!suggestion) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // Allow deletion by author or admin
        if (suggestion.authorId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.suggestion.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete suggestion" }, { status: 500 });
    }
}
