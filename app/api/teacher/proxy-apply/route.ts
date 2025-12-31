import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const proxyApplySchema = z.object({
    studentId: z.string().min(1),
    type: z.enum(["MOVEMENT", "OUTING", "EARLY_LEAVE", "OTHER"]),
    start: z.string().datetime(),
    end: z.string().datetime(),
    reason: z.string().min(1),
    location: z.string().optional()
});

export async function POST(req: Request) {
    const session = await auth();
    if (session?.user?.role !== "TEACHER") return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const { studentId, type, start, end, reason, location } = proxyApplySchema.parse(body);

        const permission = await prisma.permission.create({
            data: {
                studentId,
                teacherId: session.user.id,
                type,
                status: 'APPROVED', // Normally teacher-initiated are auto-approved
                start: new Date(start),
                end: new Date(end),
                reason: `[교사 대리 신청] ${reason}`,
                location: location || undefined
            },
            include: {
                student: true
            }
        });

        // Create Notification
        await prisma.notification.create({
            data: {
                userId: studentId,
                title: '대리 퍼미션 등록',
                message: `선생님에 의해 [${type}] 퍼미션이 등록 및 승인되었습니다.`
            }
        });

        return NextResponse.json(permission);
    } catch (e) {
        if (e instanceof z.ZodError) {
            return new NextResponse("Invalid input data", { status: 400 });
        }
        console.error("Error creating proxy permission", e);
        return new NextResponse("Error creating proxy permission", { status: 500 });
    }
}
