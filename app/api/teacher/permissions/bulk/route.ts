import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await auth();
        // Check if user is TEACHER or ADMIN
        if (!session?.user || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { studentIds, type, start, end, reason, location } = body;

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return NextResponse.json({ error: "No students selected" }, { status: 400 });
        }

        // Create multiple permission records
        // We use prisma.$transaction to ensure all or nothing
        // Status is APPROVED because Teacher is creating it.
        // If Teacher creates it, it's auto-approved? Yes, typically "Bulk Give Permission".

        await prisma.$transaction(
            studentIds.map((studentId: string) =>
                prisma.permission.create({
                    data: {
                        studentId,
                        teacherId: session.user.id,
                        type,
                        start: new Date(start), // Ensure proper date format
                        end: new Date(end),
                        reason,
                        location,
                        status: 'APPROVED' // Auto-approved
                    }
                })
            )
        );

        return NextResponse.json({ success: true, count: studentIds.length });
    } catch (error) {
        console.error("Bulk permission error:", error);
        return NextResponse.json({ error: "Failed to create permissions" }, { status: 500 });
    }
}
