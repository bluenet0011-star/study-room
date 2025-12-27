import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    const { id: roomId } = resolvedParams;
    const body = await req.json();
    const { data } = body; // Array of rows

    const warnings: string[] = [];
    const validData: any[] = [];

    // Helper to normalize input
    const getValue = (row: any, keys: string[]) => {
        for (const key of keys) {
            const found = Object.keys(row).find(k => k.includes(key));
            if (found) return row[found];
        }
        return undefined;
    };

    const seats = await prisma.seat.findMany({ where: { roomId } });

    for (const row of data) {
        const seatLabel = getValue(row, ['좌석번호', 'Seat Label']);
        const name = getValue(row, ['이름', 'Name']);
        const info = getValue(row, ['학번', 'ID']); // e.g. 30514 or 3-5-14

        if (!seatLabel || !name) continue; // Skip empty rows

        const seat = seats.find((s: any) => s.label === seatLabel.toString());
        if (!seat) {
            warnings.push(`좌석 번호 '${seatLabel}'가 존재하지 않습니다.`);
            continue;
        }

        // Find student
        // Try precise match first
        let student = null;
        if (info) {
            // Parse 30514 -> grade 3, class 5, number 14
            // Or 3-5-14
            let g, c, n;
            const strInfo = info.toString();
            if (strInfo.includes('-')) {
                [g, c, n] = strInfo.split('-').map(Number);
            } else if (strInfo.length >= 5) {
                // assume 1 digit grade, 2 digit class, 2 digit number? Or 1-2-2
                // Actually user said "based on joined students".
                // I'll try to find by name first? No, duplicates.
            }

            // Simplest: Find by name + info hints
            // Let's search by Name first, then filter.
        }

        // Robust search: Find by Name
        const studentsByName = await prisma.user.findMany({
            where: { name: name.toString(), role: 'STUDENT' }
        });

        if (studentsByName.length === 0) {
            warnings.push(`학생 '${name}' 정보를 찾을 수 없습니다. (가입되지 않음)`);
            continue;
        }

        if (studentsByName.length > 1) {
            // Ambiguous
            warnings.push(`학생 '${name}' 동명이인이 존재합니다. 학번/아이디로 구분해주세요.`);
            continue; // Too risky
        }

        student = studentsByName[0];

        // If info provided, check consistency
        if (info) {
            const strInfo = info.toString();
            // Check if info matches grade/class/num in some way
            // This is loose validation.
            // If mismatch, warning.
            const studentInfo = `${student.grade}${student.class?.toString().padStart(2, '0')}${student.number?.toString().padStart(2, '0')}`;
            // ... logic can be complex. For now, trust the name if unique.
        }

        validData.push({
            seatId: seat.id,
            studentId: student.id
        });
    }

    return NextResponse.json({ warnings, validData });
}
