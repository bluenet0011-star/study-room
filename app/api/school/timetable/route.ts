import { NextResponse } from 'next/server';
import { Timetable } from 'comcigan-parser';

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

        // Search and set school. 
        // We know the code is 79731 (Dongtan Global High School) from research.
        // However, the library usually requires a search step or setting the school directly if instantiated correctly.
        // Let's try searching first for robustness, or assume the code is stable.
        // Usually: await timetable.search('동탄국제고등학교'); 
        // Then: const school = timetable.find(s => s.code === 79731);
        // timetable.setSchool(79731);

        // Optimizing: Just set school if possible. 
        // The library might require `init` then `setSchool`.
        await timetable.setSchool(79731);

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
    } catch (error) {
        console.error("Timetable Fetch Error:", error);
        return NextResponse.json({ error: 'Failed to fetch timetable' }, { status: 500 });
    }
}
