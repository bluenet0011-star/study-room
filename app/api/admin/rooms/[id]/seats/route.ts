import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const resolvedParams = await params;
    // Allow Admin and Teacher and Student (for view)
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const seats = await prisma.seat.findMany({
        where: { roomId: resolvedParams.id },
        include: {
            assignments: {
                where: { active: true },
                include: { student: true }
            }
        }
    });
    return NextResponse.json(seats);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const resolvedParams = await params;
    if (session?.user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { seats } = body;

    // Transaction: Sync state (Delete missing, Upsert provided)
    await prisma.$transaction(async (tx: any) => {
        const currentSeats = await tx.seat.findMany({ where: { roomId: resolvedParams.id } });

        // Incoming IDs that actually exist (exclude 'new-...' temporary IDs)
        const incomingExistingIds = seats
            .map((s: any) => s.id)
            .filter((id: any) => id && !id.startsWith('new-'));

        const toDeleteIds = currentSeats
            .filter((s: any) => !incomingExistingIds.includes(s.id))
            .map((s: any) => s.id);

        if (toDeleteIds.length > 0) {
            await tx.seat.deleteMany({ where: { id: { in: toDeleteIds } } });
        }

        for (const seat of seats) {
            const isNew = !seat.id || seat.id.startsWith('new-');

            if (isNew) {
                await tx.seat.create({
                    data: {
                        roomId: resolvedParams.id,
                        label: seat.label,
                        x: seat.x,
                        y: seat.y
                    }
                });
            } else {
                await tx.seat.update({
                    where: { id: seat.id },
                    data: { x: seat.x, y: seat.y, label: seat.label }
                });
            }
        }
    });

    return NextResponse.json({ success: true });
}
