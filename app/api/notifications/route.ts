import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return NextResponse.json(notifications);
    } catch (e) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    try {
        // Mark all as read for the user
        await prisma.notification.updateMany({
            where: { userId: session.user.id, read: false },
            data: { read: true }
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
