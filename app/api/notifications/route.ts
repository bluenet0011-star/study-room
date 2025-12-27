import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const notifications = await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    return NextResponse.json(notifications);
}

export async function PUT(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    try {
        await prisma.notification.updateMany({
            where: { userId: session.user.id, read: false },
            data: { read: true }
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return new NextResponse("Error", { status: 500 });
    }
}
