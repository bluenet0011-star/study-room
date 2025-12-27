import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { assignments } = body; // [{ seatId, studentId }]

    // Transaction?
    // 1. Clear existing assignments for these seats? Or all seats in room?
    // Usually bulk assignment replaces.
    // Let's iterate and upsert `SeatAssignment`.

    // Actually, one seat can have one student (usually).
    // Unique constraint on seatId for active assignment?
    // Schema: Seat has `assignments`.

    try {
        await prisma.$transaction(async (tx: any) => {
            for (const item of assignments) {
                // Remove existing assignment for this seat
                await tx.seatAssignment.deleteMany({
                    where: { seatId: item.seatId }
                });

                // Remove existing assignment for this student (if they moved)
                // This prevents one student having 2 seats which might be invalid.
                await tx.seatAssignment.deleteMany({
                    where: { studentId: item.studentId }
                });

                // Create new
                await tx.seatAssignment.create({
                    data: {
                        seatId: item.seatId,
                        studentId: item.studentId
                    }
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return new NextResponse("Error", { status: 500 });
    }
}
