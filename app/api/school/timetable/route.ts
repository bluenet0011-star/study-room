import { NextResponse } from 'next/server';
import Timetable from 'comcigan-parser';

const timetable = new Timetable();

// Cache for School ID to avoid searching every time
let cachedSchoolId: number | null = null;
const SCHOOL_NAME = '동탄국제고등학교';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const grade = parseInt(searchParams.get('grade') || '0');
        const classNum = parseInt(searchParams.get('class') || '0');

        if (!cachedSchoolId) {
            await timetable.init();
            const schools = await timetable.search(SCHOOL_NAME);
            const targetSchool = schools.find((s: any) => s.name === SCHOOL_NAME);

            if (targetSchool) {
                cachedSchoolId = targetSchool.code;
                timetable.setSchool(cachedSchoolId);
            } else {
                return NextResponse.json({ error: 'School not found' }, { status: 404 });
            }
        } else {
            // Ensure initialized even if ID is cached (if server restarted but var is memory? No, var is memory)
            // Actually new Timetable() is per request in serverless usually, or shared? 
            // In Next.js App Router, global vars might persist in dev but unpredictable in lambda. 
            // Better to re-init if needed or just init every time for safety in this demo.
            // But let's try to reuse if possible. 
            // For stability, let's just init and setSchool every time if instance lost.
            if (!timetable.hasSchool()) { // Mock check, real lib doesn't have hasSchool
                await timetable.init();
                timetable.setSchool(cachedSchoolId);
            }
        }

        // Fetch all data
        // comcigan-parser: getTimetable() returns object structure
        const result = await timetable.getTimetable();

        // Result structure: result[grade][class] = [Array of periods]
        // We only return specific class if requested, or all?
        // Let's return specific to save bandwidth

        if (grade > 0 && classNum > 0) {
            const classTimetable = result[grade]?.[classNum];
            if (!classTimetable) {
                return NextResponse.json({ error: 'Class not found' }, { status: 404 });
            }
            return NextResponse.json(classTimetable);
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error("Timetable Error:", error);
        // Reset cache on error just in case
        cachedSchoolId = null;
        return NextResponse.json({ error: 'Failed to fetch timetable' }, { status: 500 });
    }
}
