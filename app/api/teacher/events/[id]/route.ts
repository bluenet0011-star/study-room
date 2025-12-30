import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (session?.user?.role !== "TEACHER" && session?.user?.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    try {
        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                targets: {
                    select: { studentId: true, name: true }
                },
                attendances: {
                    include: {
                        student: {
                            select: { id: true, name: true, grade: true, class: true, number: true, loginId: true }
                        }
                    },
                    orderBy: { scannedAt: 'desc' }
                }
            }
        });

        if (!event) return new NextResponse("Event not found", { status: 404 });

        return NextResponse.json(event);
    } catch (e) {
        console.error("Failed to fetch event details", e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    // Allow teachers to record attendance
    if (session?.user?.role !== "TEACHER" && session?.user?.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { studentId, studentLoginId } = body;
    // We might scan Student ID (string) or Login ID. 
    // Usually barcode/QR contains one of these. Assuming 'studentId' refers to the User.id or User.loginId depending on implementation.
    // The previous frontend implementation sent { name, id }. 
    // Let's assume the scan result is a unique identifier for the student (loginId or DB id).
    // For robust matching, we should try to find the student first.

    if (!studentId && !studentLoginId) return new NextResponse("Missing student identifier", { status: 400 });

    try {
        // 1. Find Student
        let student;
        if (studentId) { // Direct DB ID
            student = await prisma.user.findUnique({ where: { id: studentId } });
        }
        if (!student && studentLoginId) { // Login ID / Barcode sometimes
            student = await prisma.user.findUnique({ where: { loginId: studentLoginId } });
        }

        // If searching by "Student Number" (e.g. 10101), we might need another check
        // Ideally scan provides a unique ID.
        // If scan input is just "10101", we need to search.

        // Let's support searching by loginId (which might be the student number in some setups) OR id.
        if (!student) {
            // Fallback: try to find by loginId if studentId was passed but not found as GUID
            student = await prisma.user.findUnique({ where: { loginId: studentId } });
        }

        if (!student) return new NextResponse("Student not found", { status: 404 });

        // 2. Record Attendance
        const attendance = await prisma.eventAttendance.upsert({
            where: {
                eventId_studentId: {
                    eventId: id,
                    studentId: student.id
                }
            },
            update: {
                scannedAt: new Date() // Update time if scanned again? Or ignore? Let's update.
            },
            create: {
                eventId: id,
                studentId: student.id,
                scannedAt: new Date()
            },
            include: {
                student: {
                    select: { id: true, name: true, grade: true, class: true, number: true }
                }
            }
        });

        return NextResponse.json(attendance);
    } catch (e) {
        console.error("Attendance record failed", e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
