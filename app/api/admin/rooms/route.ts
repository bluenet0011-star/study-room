import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "TEACHER") return new NextResponse("Unauthorized", { status: 401 });

    const rooms = await prisma.room.findMany({ include: { seats: true } });
    return NextResponse.json(rooms);
}

export async function POST(req: Request) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'TEACHER') {
        return new NextResponse("Unauthorized", { status: 401 });
    } const body = await req.json();
    const { name, grade } = body;

    if (!name) return new NextResponse("Name required", { status: 400 });

    const room = await prisma.room.create({
        data: { name, grade: parseInt(grade) || null }
    });
    return NextResponse.json(room);
}
