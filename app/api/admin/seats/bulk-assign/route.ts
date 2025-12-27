import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { roomId, assignments } = await req.json();

        // 1. Get all seats in the room
        const seats = await prisma.seat.findMany({
            where: { roomId }
        });

        // 2. Get all students (optimize by fetching only needed or finding one by one?)
        // Let's find students by name one by one for simplicity in this bulk op, or perform a bulk find.
        // Given potentially ambiguous names, exact match on name + role=STUDENT is risky but requested.
        // Better to match LoginID if provided, but user said "Student Name".
        // We will try to find students by name.

        const results = {
            successCount: 0,
            errors: [] as string[]
        };

        const students = await prisma.user.findMany({
            where: { role: 'STUDENT', active: true },
            select: { id: true, name: true, loginId: true }
        });

        for (const item of assignments) { // { seatLabel, studentName }
            const seat = seats.find(s => s.label === item.seatLabel);
            if (!seat) {
                results.errors.push(`Seat '${item.seatLabel}' not found`);
                continue;
            }

            // Find student by Name (first match)
            const student = students.find(s => s.name === item.studentName);
            // OR checks loginId?
            // const student = students.find(s => s.name === item.studentName || s.loginId === item.studentName);

            if (!student) {
                results.errors.push(`Student '${item.studentName}' not found`);
                continue;
            }

            // Deactivate old assignment for this seat if any
            await prisma.seatAssignment.updateMany({
                where: { seatId: seat.id, active: true },
                data: { active: false, endDate: new Date() }
            });

            // Create new assignment
            await prisma.seatAssignment.create({
                data: {
                    seatId: seat.id,
                    userId: student.id,
                    active: true,
                    startDate: new Date()
                }
            });
            results.successCount++;
        }

        return NextResponse.json(results);

    } catch (e) {
        console.error(e);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
