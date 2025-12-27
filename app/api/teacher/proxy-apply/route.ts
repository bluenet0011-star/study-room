import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (session?.user?.role !== "TEACHER") return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { studentId, type, start, end, reason } = await req.json();

        const permission = await prisma.permission.create({
            data: {
                studentId,
                teacherId: session.user.id,
                type,
                status: 'APPROVED', // Normally teacher-initiated are auto-approved
                start: new Date(start),
                end: new Date(end),
                reason: `[교사 대리 신청] ${reason}`
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
        return new NextResponse("Error creating proxy permission", { status: 500 });
    }
}
