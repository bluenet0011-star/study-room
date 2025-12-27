import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const { id } = await params;
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const now = new Date();

    // 1. Get Seats
    const seats = await prisma.seat.findMany({
        where: { roomId: id },
        include: {
            assignments: {
                where: { active: true },
                include: { student: { select: { id: true, name: true, grade: true, class: true, number: true } } }
            }
        }
    });

    // 2. Get Active Permissions for students in this room
    // Simple approach: Get all active permissions intersecting now
    const activePermissions = await prisma.permission.findMany({
        where: {
            status: 'APPROVED',
            start: { lte: now },
            end: { gte: now }
        }
    });

    // Map permissions by studentId
    const permissionMap = new Map();
    activePermissions.forEach(p => permissionMap.set(p.studentId, p));

    // Combine Data
    const seatData = seats.map((seat: any) => {
        const assignment = seat.assignments[0]; // Assuming 1 active assignment per seat
        let status = 'EMPTY';
        let student = null;
        let permission = null;

        if (assignment) {
            status = 'OCCUPIED';
            student = assignment.student;
            const perm = permissionMap.get(student.id);
            if (perm) {
                status = perm.type; // MOVEMENT, OUTING, etc
                permission = perm;
            }
        }

        return {
            ...seat,
            status,
            student,
            permission
        };
    });

    return NextResponse.json(seatData);
}
