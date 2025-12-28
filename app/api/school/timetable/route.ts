import { NextResponse } from 'next/server';
import Timetable from 'comcigan-parser';

const timetable = new Timetable();

// Cache for School ID to avoid searching every time
let cachedSchoolId: number | null = null;
const SCHOOL_NAME = '동탄국제고등학교';
const SCHOOL_CODE = 79731; // Dongtan International High School (Corrected Code)

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const grade = parseInt(searchParams.get('grade') || '0');
        const classNum = parseInt(searchParams.get('class') || '0');

        // Always init and set school to ensure fresh instance behavior in serverless
        await timetable.init();
        timetable.setSchool(SCHOOL_CODE);

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
        return NextResponse.json({ error: 'Failed to fetch timetable' }, { status: 500 });
    }
}
