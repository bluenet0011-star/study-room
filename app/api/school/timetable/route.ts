import { NextResponse } from 'next/server';
import Timetable from 'comcigan-parser';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const grade = parseInt(searchParams.get('grade') || '0');
    const classNum = parseInt(searchParams.get('class') || '0');

    if (!grade || !classNum) {
        return NextResponse.json({ error: 'Grade and Class are required' }, { status: 400 });
    }

    try {
        const timetable = new Timetable();
        await timetable.init();

        // Search is required to establish session/cookie for some versions
        const schoolList = await timetable.search('동탄국제고등학교');

        // Find the school by code or name
        const school = schoolList.find((s: any) => s.code === 79731);

        if (!school) {
            return NextResponse.json({ error: 'School not found during search' }, { status: 404 });
        }

        await timetable.setSchool(school.code);

        const result = await timetable.getTimetable();

        // result structure: result[grade][class][weekday][period]
        // Weekday: 0(Sun), 1(Mon), ..., 5(Fri)
        // Period: 0-based index? Usually 1-based or 0-based depending on lib.
        // Comcigan-parser usually returns: result[grade][class][day][period] = { ... }

        // Let's return the whole week for this class
        const classTimetable = result[grade]?.[classNum];

        if (!classTimetable) {
            return NextResponse.json({ error: 'Data not found' }, { status: 404 });
        }

        return NextResponse.json(classTimetable);
    } catch (error: any) {
        console.error("Timetable Fetch Error:", error);
        return NextResponse.json({
            error: 'Failed to fetch timetable',
            details: error.message || String(error)
        }, { status: 500 });
    }
}
