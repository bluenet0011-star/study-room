import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const resolvedParams = await params;
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "TEACHER") return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { password } = await req.json();
        if (!password || password.length < 4) return new NextResponse("Invalid password", { status: 400 });

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: resolvedParams.id },
            data: { passwordHash: hashedPassword }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        return new NextResponse("Error updating password", { status: 500 });
    }
}
