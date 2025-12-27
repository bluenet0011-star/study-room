import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "TEACHER") return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    const students = await prisma.user.findMany({
        where: {
            role: "STUDENT" as any, // Using string because of SQLite enum issues
            active: true,
            OR: [
                { name: { contains: query } },
                { loginId: { contains: query } }
            ]
        },
        select: {
            id: true,
            name: true,
            grade: true,
            class: true,
            number: true
        },
        take: 10
    });

    return NextResponse.json(students);
}
