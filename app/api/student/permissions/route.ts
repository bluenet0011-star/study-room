import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";


const permissionSchema = z.object({
    start: z.string(),
    end: z.string(),
    reason: z.string().min(1),
    teacherId: z.string().min(1),
    type: z.enum(["OUTING", "MOVEMENT", "EARLY_LEAVE", "OTHER"]),
    location: z.string().optional(),
});

// GET handler (Updated for Teacher Access)
export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const studentIdParam = searchParams.get('studentId');

    let where: any = { studentId: session.user.id };

    // If Teacher/Admin allows viewing other students
    if (studentIdParam && (session.user.role === 'TEACHER' || session.user.role === 'ADMIN')) {
        where = { studentId: studentIdParam };
    }

    const permissions = await prisma.permission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { teacher: { select: { name: true } } }
    });
    return NextResponse.json(permissions);
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const data = permissionSchema.parse(body);

        const start = new Date(data.start);
        const end = new Date(data.end);
        if (end <= start) return new NextResponse("End time must be after start time", { status: 400 });

        const permission = await prisma.permission.create({
            data: {
                studentId: session.user.id,
                teacherId: data.teacherId,
                type: data.type,
                start,
                end,
                reason: data.reason,
                location: data.location,
                status: "PENDING"
            },
            include: { student: { select: { name: true } } }
        });



        return NextResponse.json(permission);

    } catch (e) {
        return new NextResponse("Invalid request", { status: 400 });
    }
}
