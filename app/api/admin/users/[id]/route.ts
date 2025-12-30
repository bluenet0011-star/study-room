import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await params;

        // Check target user role
        const targetUser = await prisma.user.findUnique({ where: { id } });
        if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Authorization Logic
        const isSelf = session.user.id === id;
        const isAdmin = session.user.role === 'ADMIN';
        const isTeacher = session.user.role === 'TEACHER';

        // Admin: can delete anyone (except self? probably ok for now or self-destruct)
        // Teacher: can delete only STUDENT
        // Student: cannot delete anyone (even self? usually separate account closure)

        if (isAdmin) {
            // Allowed
        } else if (isTeacher) {
            if (targetUser.role !== 'STUDENT') {
                return NextResponse.json({ error: 'Teachers can only delete students' }, { status: 403 });
            }
        } else {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.user.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await params;
        const body = await request.json();
        const { password, ...rest } = body;

        // Check target user
        const targetUser = await prisma.user.findUnique({ where: { id: id } });
        if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Authorization Logic
        const isAdmin = session.user.role === 'ADMIN';
        const isTeacher = session.user.role === 'TEACHER';

        // Teacher can update STUDENT
        if (isTeacher && targetUser.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Teachers can only edit students' }, { status: 403 });
        }
        if (!isAdmin && !isTeacher) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const data: any = { ...rest };
        if (password) {
            data.passwordHash = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data
        });

        return NextResponse.json(user);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
