import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const noticeSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    target: z.string().optional(),
    important: z.boolean().optional(),
});

// GET handler
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const notice = await prisma.notice.findUnique({
        where: { id },
        include: { author: { select: { name: true } } }
    });
    if (!notice) return new NextResponse("Not found", { status: 404 });
    return NextResponse.json(notice);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (session?.user?.role === 'STUDENT') return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const data = noticeSchema.parse(body);

        const notice = await prisma.notice.update({
            where: { id },
            data
        });

        return NextResponse.json(notice);
    } catch (e) {
        return new NextResponse("Error updating notice", { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (session?.user?.role === 'STUDENT') return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;

    try {
        await prisma.notice.delete({
            where: { id }
        });
        return new NextResponse(null, { status: 204 });
    } catch (e) {
        return new NextResponse("Error deleting notice", { status: 500 });
    }
}
