'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface TimetableGridProps {
    grade: number;
    classNum: number;
}

export function TimetableGrid({ grade, classNum }: TimetableGridProps) {
    const [timetable, setTimetable] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!grade || !classNum) {
            setError("학년/반 정보가 없습니다.");
            setLoading(false);
            return;
        }

        fetch(`/api/school/timetable?grade=${grade}&class=${classNum}`)
            .then(async (res) => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                setTimetable(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError("시간표를 불러오는 중 오류가 발생했습니다.");
                setLoading(false);
            });
    }, [grade, classNum]);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500" /></div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
    if (!timetable) return <div className="text-center p-10">시간표 데이터가 없습니다.</div>;

    // timetable structure from comcigan-parser: 
    // It usually returns an array where index 0 is empty? 
    // And days are usually 1=Mon, 2=Tue...
    // Let's verify structure. Based on comcigan-parser docs, result for a class is:
    // [ [period1, period2...], [Tue...], ... ] 
    // Actually it's: [null, [Mon], [Tue], [Wed], [Thu], [Fri], [Sat]...]
    // Each day array contains period objects or strings?
    // The parser returns simple objects often: { grade, class, weekday, period, subject, teacher... }? 
    // No, standard `getTimetable` returns: result[grade][class][weekday][period] = subject_string (or object)
    // My API returns `result[grade][class]` which is `[weekday][period]` array.
    // So `timetable` here is `[null, [period1...], [period1...], ...]` (index is weekday).

    const weekdays = ['월', '화', '수', '목', '금'];
    const periods = [1, 2, 3, 4, 5, 6, 7]; // Usually 7 or 8 periods

    // Current day/period for highlighting
    const now = new Date();
    const currentDay = now.getDay(); // 0=Sun, 1=Mon...
    // Simple period calculation approximation or just highlight day

    return (
        <div className="overflow-x-auto">
            <div className="w-full md:min-w-[600px] border rounded-lg bg-white shadow-sm">
                <div className="grid grid-cols-6 bg-gray-50 border-b text-center text-xs md:text-sm font-medium text-gray-700 divide-x">
                    <div className="p-2 md:p-3 bg-gray-100">교시</div>
                    {weekdays.map((day, i) => (
                        <div key={day} className={`p-2 md:p-3 ${currentDay === i + 1 ? 'bg-blue-50 text-blue-700 font-bold' : ''}`}>
                            {day}
                        </div>
                    ))}
                </div>

                <div className="divide-y">
                    {periods.map((period, pIdx) => (
                        <div key={period} className="grid grid-cols-6 text-center text-xs md:text-sm divide-x hover:bg-gray-50/50 transition-colors">
                            <div className="p-2 md:p-3 bg-gray-50 font-medium text-gray-500 flex items-center justify-center">
                                {period}
                            </div>
                            {weekdays.map((_, dIdx) => {
                                const dayData = timetable[dIdx + 1]; // 1-based index (1=Mon)
                                const rawSubject = dayData ? dayData[period] : '';

                                let displaySubject = '';
                                if (typeof rawSubject === 'string') {
                                    displaySubject = rawSubject;
                                } else if (typeof rawSubject === 'object' && rawSubject !== null) {
                                    displaySubject = rawSubject.subject || rawSubject.name || ''; // Changed to check name potentially
                                }

                                return (
                                    <div key={dIdx} className={`p-1 md:p-3 flex items-center justify-center min-h-[50px] md:min-h-[60px] ${currentDay === dIdx + 1 ? 'bg-blue-50/30' : ''}`}>
                                        {displaySubject ? (
                                            <span className="font-medium text-gray-800 break-keep text-xs md:text-sm leading-tight tracking-tight">
                                                {displaySubject}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300">-</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-2 text-xs text-gray-400 text-right">
                * 시간표는 학교 사정에 따라 변경될 수 있습니다. (출처: 컴시간)
            </div>
        </div>
    );
}
