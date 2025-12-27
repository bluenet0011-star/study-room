import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { io } from "socket.io-client";

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
    if (status === 'APPROVED' || status === 'REJECTED') {
        const title = status === 'APPROVED' ? '퍼미션 승인' : '퍼미션 반려';
        const message = `[${permission.type}] 신청이 ${status === 'APPROVED' ? '승인' : '반려'}되었습니다.`;

        await prisma.notification.create({
            data: {
                userId: permission.studentId,
                title,
                message
            }
        });
    }

    // Notify via Socket
    const socket = io("http://localhost:3000"); // Internal connection
    socket.emit("PERMISSION_UPDATE", {
        permissionId: permission.id,
        studentId: permission.studentId,
        status
    });

    return NextResponse.json(permission);
}
