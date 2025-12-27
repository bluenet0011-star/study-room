import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const noticeSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    target: z.string().optional(),
    important: z.boolean().optional(),
});

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const where = search ? {
        title: { contains: search }
    } : {};

    const [notices, total] = await Promise.all([
        prisma.notice.findMany({
            where,
            include: { author: { select: { name: true } } },
            orderBy: [{ important: 'desc' }, { createdAt: 'desc' }],
            skip,
            take: limit,
        }),
        prisma.notice.count({ where })
    ]);

    return NextResponse.json({ notices, total, pages: Math.ceil(total / limit) });
}

export async function POST(req: Request) {
    const session = await auth();
    // Only teachers/admins should post
    if (session?.user?.role === 'STUDENT') return new NextResponse("Unauthorized", { status: 401 });
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const data = noticeSchema.parse(body);

        const notice = await prisma.notice.create({
            data: {
                ...data,
                authorId: session.user.id
            }
        });

        return NextResponse.json(notice);
    } catch (error) {
        return new NextResponse("Invalid request", { status: 400 });
    }
}
