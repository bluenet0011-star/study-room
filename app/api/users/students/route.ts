import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    // Allow Admin and Teacher
    if (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
        return new NextResponse("Forbidden", { status: 403 });
    }

    try {
        const students = await prisma.user.findMany({
            where: { role: 'STUDENT', active: true },
            select: {
                id: true,
                loginId: true,
                name: true,
                grade: true,
                class: true,
                number: true,
                role: true,
                active: true
            },
            orderBy: [
                { grade: 'asc' },
                { class: 'asc' },
                { number: 'asc' }
            ]
        });

        return NextResponse.json(students);
    } catch (e) {
        return new NextResponse("Error fetching students", { status: 500 });
    }
}
