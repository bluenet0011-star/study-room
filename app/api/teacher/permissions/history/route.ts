import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth();
    if (session?.user?.role !== "TEACHER") return new NextResponse("Unauthorized", { status: 401 });

    const permissions = await prisma.permission.findMany({
        where: {
            status: { in: ['APPROVED', 'REJECTED'] }
        },
        include: {
            student: true
        },
        orderBy: {
            updatedAt: 'desc'
        },
        take: 50
    });

    return NextResponse.json(permissions);
}
