import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth();
    // Allow any authenticated user to see teacher list (Student needs it to select teacher)
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const teachers = await prisma.user.findMany({
        where: { role: "TEACHER", active: true },
        select: { id: true, name: true, grade: true, class: true },
        orderBy: { name: 'asc' }
    });
    return NextResponse.json(teachers);
}
