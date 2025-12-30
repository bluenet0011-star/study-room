
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        const suggestions = await prisma.suggestion.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                }
            }
        });

        return NextResponse.json(suggestions);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { title, content } = body;

        const suggestion = await prisma.suggestion.create({
            data: {
                title,
                content,
                authorId: session.user.id
            }
        });

        return NextResponse.json(suggestion);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create suggestion" }, { status: 500 });
    }
}
