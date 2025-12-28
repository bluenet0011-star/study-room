import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return new NextResponse("Unauthorized", { status: 401 });

    try {
        const users = await prisma.user.findMany({ select: { id: true, loginId: true, name: true, role: true, grade: true, class: true, number: true } });
        const rooms = await prisma.room.findMany({ include: { seats: true } });
        const permissions = await prisma.permission.findMany({
            take: 1000,
            orderBy: { createdAt: 'desc' },
            include: { student: { select: { name: true } } }
        });

        const data = {
            timestamp: new Date().toISOString(),
            users,
            rooms,
            permissions
        };

        return new NextResponse(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="study-room-backup-${new Date().toISOString().slice(0, 10)}.json"`
            }
        });

    } catch (e) {
        return new NextResponse("Export Failed", { status: 500 });
    }
}
