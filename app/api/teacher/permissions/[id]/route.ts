import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/push-server";


export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const { id } = await params;
    if (session?.user?.role !== "TEACHER") return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { status, teacherNote } = body;

    const permission = await prisma.permission.update({
        where: { id: id },
        data: {
            status,
            teacherNote
        },
        include: { student: true }
    });

    // Create Notification
    let title = "";
    let message = "";

    if (status === 'APPROVED') {
        title = '퍼미션 승인';
        message = `[${permission.type}] 신청이 승인되었습니다.`;
    } else if (status === 'REJECTED') {
        title = '퍼미션 반려';
        message = `[${permission.type}] 신청이 반려되었습니다.`;
    } else if (status === 'PENDING') {
        title = '퍼미션 상태 변경';
        message = `[${permission.type}] 신청 상태가 대기중으로 변경되었습니다.`;
    }

    if (title) {
        await prisma.notification.create({
            data: {
                userId: permission.studentId,
                title,
                message
            }
        });

        // Send Push Notification
        await sendPushNotification({
            userId: permission.studentId,
            title,
            message,
            url: "/student/permissions" // Student view
        });
    }



    return NextResponse.json(permission);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const { id } = await params;
    if (session?.user?.role !== "TEACHER") return new NextResponse("Unauthorized", { status: 401 });

    try {
        await prisma.permission.delete({
            where: { id: id }
        });
        return new NextResponse(null, { status: 204 });
    } catch (e) {
        return new NextResponse("Error deleting permission", { status: 500 });
    }
}
