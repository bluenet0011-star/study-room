import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // params is a Promise in usage, though here as 2nd arg it might be pre-resolved in standard Next.js route handlers? 
    // In Next.js 15 App Router, route handlers receive `context` as second arg. `params` IS a Promise or object?
    // Docs say: `params` is an object in previous versions, but context is `{ params: Promise<{ id: string }> }` in 15?
    // Actually standard signature `(request, context)` where context.params.
    // Let's assume params might be needed to be awaited or used directly.
    // Safe bet: accessing params works, but let's treat context correctly.
) {
    // In Next 15: "Route Handlers receive a context argument... context.params is a promise"
    // So we need to await it if we are structured strictly.
    const { id } = await params;

    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Check ownership or admin
        const item = await prisma.lostItem.findUnique({
            where: { id: id },
            select: { authorId: true }
        });

        if (!item) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        const isAdmin = session.user.role === 'ADMIN';
        const isAuthor = item.authorId === session.user.id;

        if (!isAdmin && !isAuthor) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.lostItem.delete({
            where: { id: id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
