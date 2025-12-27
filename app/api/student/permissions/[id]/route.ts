import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const resolvedParams = await params;
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const permission = await prisma.permission.findUnique({
            where: { id: resolvedParams.id },
            include: { student: true }
        });

        if (!permission) return new NextResponse("Not Found", { status: 404 });

        // Check ownership (Student can only delete their own)
        if (session.user.role === 'STUDENT' && permission.studentId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Allow deletion if status is PENDING or APPROVED (user requested cancel even if approved)
        // Teachers/Admins can delete any
        await prisma.permission.delete({
            where: { id: resolvedParams.id }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        return new NextResponse("Error deleting permission", { status: 500 });
    }
}
