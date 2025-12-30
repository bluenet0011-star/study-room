'use client';

import { Card, CardContent } from '@/components/ui/card';

interface TimetableGridProps {
    grade: number;
    classNum: number;
}

export function TimetableGrid({ grade, classNum }: TimetableGridProps) {
    return (
        <div className="w-full h-[800px] bg-white rounded-lg shadow-sm border overflow-hidden">
            <iframe
                src="http://www.xn--s39aj90b0nb2xw6xh.kr/"
                className="w-full h-full border-0"
                title="School Timetable"
                allowFullScreen
            />
        </div>
    );
}
