import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

    const users = await prisma.user.findMany({
        orderBy: { name: 'asc' }
    });
    return NextResponse.json(users);
}

// POST for Bulk Create/Update
export async function POST(req: Request) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { users } = body; // Expects array of users

    if (!Array.isArray(users)) return new NextResponse("Invalid data", { status: 400 });

    const results = [];
    for (const user of users) {
        if (!user.loginId || !user.name) continue;

        const hashedPassword = user.password ? await bcrypt.hash(user.password, 10) : undefined;

        try {
            const upserted = await prisma.user.upsert({
                where: { loginId: user.loginId },
                update: {
                    name: user.name,
                    role: user.role as Role || Role.STUDENT,
                    grade: parseInt(user.grade) || null,
                    class: parseInt(user.class) || null,
                    number: parseInt(user.number) || null,
                    ...(hashedPassword && { passwordHash: hashedPassword }),
                    active: user.active !== false
                },
                create: {
                    loginId: user.loginId,
                    name: user.name,
                    role: user.role as Role || Role.STUDENT,
                    grade: parseInt(user.grade) || null,
                    class: parseInt(user.class) || null,
                    number: parseInt(user.number) || null,
                    passwordHash: hashedPassword || await bcrypt.hash("1234", 10), // Default password
                    active: user.active !== false
                }
            });
            results.push({ loginId: user.loginId, status: "success" });
        } catch (e) {
            console.error(e);
            results.push({ loginId: user.loginId, status: "failed" });
        }
    }

    return NextResponse.json({ results });
}
