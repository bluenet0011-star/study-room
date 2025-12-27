import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Delete related seats first
        await prisma.seat.deleteMany({ where: { roomId: id } });

        // Delete the room
        await prisma.room.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
    }
}
