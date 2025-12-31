import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth();
    if (session?.user?.role !== "TEACHER") return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Fetch total count for pagination metadata
    const total = await prisma.permission.count({
        where: { teacherId: session.user.id } // Filter consistent with findMany
    });

    const permissions = await prisma.permission.findMany({
        where: { teacherId: session.user.id },
        include: { student: { select: { name: true, grade: true, class: true, number: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
    });

    return NextResponse.json({
        permissions,
        meta: {
            total,
            page,
            lastPage: Math.ceil(total / limit)
        }
    });
}
