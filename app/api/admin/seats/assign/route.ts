import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { io } from "socket.io-client";

export async function POST(req: Request) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { seatId, studentId, action } = await req.json();

        if (action === "ASSIGN") {
            // Deactivate existing assignments for this seat
            await prisma.seatAssignment.updateMany({
                where: { seatId, active: true },
                data: { active: false }
            });

            // Deactivate existing assignments for this student
            await prisma.seatAssignment.updateMany({
                where: { userId: studentId, active: true },
                data: { active: false }
            });

            const assignment = await prisma.seatAssignment.create({
                data: {
                    seatId,
                    userId: studentId,
                    active: true
                }
            });

            // Notify via Socket
            const socket = io("http://localhost:3000");
            socket.emit("SEAT_UPDATE", { seatId, action: 'ASSIGN' });

            return NextResponse.json(assignment);
        } else if (action === "UNASSIGN") {
            await prisma.seatAssignment.updateMany({
                where: { seatId, active: true },
                data: { active: false }
            });

            // Notify via Socket
            const socket = io("http://localhost:3000");
            socket.emit("SEAT_UPDATE", { seatId, action: 'UNASSIGN' });

            return NextResponse.json({ success: true });
        }

        return new NextResponse("Invalid action", { status: 400 });
    } catch (e) {
        return new NextResponse("Error assigning seat", { status: 500 });
    }
}
