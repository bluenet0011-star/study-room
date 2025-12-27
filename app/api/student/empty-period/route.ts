import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const emptyPeriodSchema = z.object({
    date: z.string(),
    start: z.string(),
    end: z.string(),
    location: z.string().min(1),
    memo: z.string().optional()
});

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const requests = await prisma.emptyPeriod.findMany({
        where: { studentId: session.user.id },
        orderBy: { date: 'desc' }
    });
    return NextResponse.json(requests);
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const data = emptyPeriodSchema.parse(body);

        const record = await prisma.emptyPeriod.create({
            data: {
                studentId: session.user.id,
                date: new Date(data.date),
                start: new Date(`${data.date}T${data.start}`),
                end: new Date(`${data.date}T${data.end}`),
                location: data.location,
                memo: data.memo
            }
        });
        return NextResponse.json(record);
    } catch (e) {
        return new NextResponse("Invalid request", { status: 400 });
    }
}
