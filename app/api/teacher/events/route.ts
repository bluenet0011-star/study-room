import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import fs from 'fs';
import path from 'path';

const FALLBACK_PATH = path.join(process.cwd(), 'data/events.json');

// Helper for JSON fallback
function getJsonEvents() {
    if (!fs.existsSync(FALLBACK_PATH)) return [];
    try {
        return JSON.parse(fs.readFileSync(FALLBACK_PATH, 'utf-8'));
    } catch { return []; }
}

function saveJsonEvents(events: any[]) {
    if (!fs.existsSync(path.dirname(FALLBACK_PATH))) {
        fs.mkdirSync(path.dirname(FALLBACK_PATH), { recursive: true });
    }
    fs.writeFileSync(FALLBACK_PATH, JSON.stringify(events, null, 2));
}

export async function GET() {
    try {
        // Try DB first
        // @ts-ignore
        const events = await prisma.event.findMany({
            orderBy: { date: 'desc' },
            // @ts-ignore
            include: { _count: { select: { attendances: true } } }
        });

        const formatted = events.map((e: any) => ({
            id: e.id,
            title: e.title,
            date: e.date.toISOString().split('T')[0],
            count: e._count.attendances
        }));
        return NextResponse.json(formatted);

    } catch (e) {
        // Fallback to JSON
        console.warn("DB failed, using JSON fallback for events");
        return NextResponse.json(getJsonEvents());
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        try {
            // Try DB
            // @ts-ignore
            // @ts-ignore
            // @ts-ignore
            // @ts-ignore
            const event = await prisma.event.create({
                data: {
                    title: body.title,
                    date: body.date ? new Date(body.date) : new Date(),
                    targets: {
                        create: body.targets || []
                    }
                }
            });
            return NextResponse.json(event);
        } catch (dbError) {
            // Fallback
            const events = getJsonEvents();
            const newEvent = {
                id: Date.now().toString(),
                title: body.title,
                date: new Date().toISOString().split('T')[0],
                count: 0
            };
            events.unshift(newEvent);
            saveJsonEvents(events);
            return NextResponse.json(newEvent);
        }
    } catch (e) {
        return new NextResponse("Error", { status: 500 });
    }
}
