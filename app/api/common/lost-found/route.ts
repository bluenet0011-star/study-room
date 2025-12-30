import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('q') || '';

        const where = search ? {
            OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                { content: { contains: search, mode: 'insensitive' as const } },
                { location: { contains: search, mode: 'insensitive' as const } },
                { keeper: { contains: search, mode: 'insensitive' as const } }
            ]
        } : {};

        const items = await prisma.lostItem.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { name: true }
                }
            }
        });
        return NextResponse.json(items);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, content, location, keeper, status } = body;

        const newItem = await prisma.lostItem.create({
            data: {
                title,
                content,
                location,
                keeper,
                status: status || 'LOST',
                authorId: session.user.id,
            },
            include: {
                author: {
                    select: { name: true }
                }
            }
        });

        return NextResponse.json(newItem);
    } catch (error) {
        console.error("Failed to save lost item:", error);
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
}
