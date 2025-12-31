import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth();
    if (session?.user?.role !== "TEACHER") return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Fetch teacher details to get grade/class
    const teacher = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { grade: true, class: true }
    });

    const whereClause: any = {
        OR: [
            { teacherId: session.user.id },
            // If teacher has homeroom, show permissions from that class
            ...(teacher?.grade && teacher?.class ? [{
                student: {
                    grade: teacher.grade,
                    class: teacher.class
                }
            }] : [])
        ]
    };

    if (search) {
        // AND logic with the OR group
        // Prisma AND syntax with OR inside
        whereClause.AND = {
            student: {
                name: { contains: search, mode: 'insensitive' }
            }
        };
    }

    // Fetch total count for pagination metadata
    const total = await prisma.permission.count({
        where: whereClause
    });

    const permissions = await prisma.permission.findMany({
        where: whereClause,
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
