import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const passwordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(4),
});

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const { currentPassword, newPassword } = passwordSchema.parse(body);

        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user || !user.passwordHash) return new NextResponse("User not found", { status: 404 });

        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) return new NextResponse("현재 비밀번호가 일치하지 않습니다.", { status: 400 });

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: session.user.id },
            data: { passwordHash: hashedPassword }
        });

        return NextResponse.json({ success: true });

    } catch (e) {
        return new NextResponse("Invalid request", { status: 400 });
    }
}
