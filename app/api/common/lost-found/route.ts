import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data/lost-items.json');

// Ensure data dir exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

function getItems() {
    if (!fs.existsSync(DB_PATH)) return [];
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function saveItems(items: any[]) {
    fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2));
}

export async function GET() {
    return NextResponse.json(getItems());
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const items = getItems();

        const newItem = {
            id: Date.now().toString(),
            ...body,
            createdAt: new Date().toISOString(),
            // Mock author if not provided (server session handling omitted for brevity/speed)
            author: { name: body.authorName || '익명' }
        };

        items.unshift(newItem); // Add to top
        saveItems(items);

        return NextResponse.json(newItem);
    } catch (error) {
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
}
