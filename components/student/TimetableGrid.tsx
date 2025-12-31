'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CalendarClock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimetableGridProps {
    grade: number;
    classNum: number;
}

interface Period {
    subject: string;
    teacher?: string;
    room?: string;
    changed?: boolean;
}

const WEEKDAYS = ['월', '화', '수', '목', '금'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];

export function TimetableGrid({ grade, classNum }: TimetableGridProps) {
    const [timetable, setTimetable] = useState<any[][]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTimetable = async () => {
        if (!grade || !classNum) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/school/timetable?grade=${grade}&class=${classNum}`);
            if (!res.ok) throw new Error("시간표를 불러오지 못했습니다.");
            const data = await res.json();
            // Comcigan usually returns [?, [Mon], [Tue], [Wed], [Thu], [Fri], ...]
            // Or [ [Mon], [Tue] ]?
            // We'll inspect structure. If it's the standard parser, index 0 is usually metadata or empty.
            // Let's assume data is the array for the class.
            setTimetable(data);
        } catch (e) {
            console.error(e);
            setError("시간표 데이터 수신 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimetable();
    }, [grade, classNum]);

    if (!grade || !classNum) {
        return (
            <Card className="bg-gray-50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-10 text-gray-500">
                    <CalendarClock className="w-10 h-10 mb-2 opacity-20" />
                    <p>학년/반 정보가 없습니다.</p>
                </CardContent>
            </Card>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 border rounded-lg bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-64 border rounded-lg bg-red-50 text-red-600 gap-2">
                <p>{error}</p>
                <Button variant="outline" size="sm" onClick={fetchTimetable} className="bg-white">
                    <RefreshCw className="w-4 h-4 mr-2" /> 다시 시도
                </Button>
            </div>
        );
    }

    // Transform Data
    // Assuming data[weekdayIndex][periodIndex]
    // weekdayIndex: 1=Mon ... 5=Fri
    const getSubject = (dayIdx: number, periodIdx: number) => {
        // Safe access
        if (!timetable || !timetable[dayIdx]) return null;
        const periodData = timetable[dayIdx][periodIdx];

        // periodData might be string, or object, or formatted string "Subject(Teacher)"
        // Comcigan Parser V2 often returns objects options.
        // If it's raw comcigan-parser: 
        // 1234 -> Subject Code?
        // Actually the parser usually maps it.
        // Let's assume it returns { subject: 'Math', ... } or just 'Math'.

        // If data is just [Match, History...], fine.
        // We'll render whatever JSON we got to debug if needed, but for now:
        return periodData;
    };

    return (
        <div className="space-y-4">
            {/* Mobile View (Tabs or Stack) - We'll use a responsive grid */}
            {/* Desktop Table */}
            <div className="hidden md:block overflow-hidden rounded-lg border shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="py-3 px-4 border-b font-medium w-16 text-center">교시</th>
                            {WEEKDAYS.map(day => (
                                <th key={day} className="py-3 px-4 border-b font-medium text-center">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y">
                        {PERIODS.map(period => (
                            <tr key={period} className="hover:bg-gray-50">
                                <td className="py-4 px-4 font-bold text-center text-gray-500 bg-gray-50/50">{period}</td>
                                {WEEKDAYS.map((_, idx) => {
                                    const dayIdx = idx; // 0-based index for Mon(0)-Fri(4)
                                    const data = getSubject(dayIdx, period - 1);
                                    return (
                                        <td key={`${dayIdx}-${period}`} className="py-4 px-2 text-center relative group">
                                            {/* Render Logic */}
                                            {typeof data === 'string' ? (
                                                <span className="font-medium text-gray-800">{data}</span>
                                            ) : typeof data === 'object' && data !== null ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="font-bold text-gray-900">{data.subject}</span>
                                                    {data.teacher && <span className="text-xs text-gray-500">{data.teacher}</span>}
                                                    {data.room && <span className="text-[10px] text-blue-400">({data.room})</span>}
                                                </div>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View (Cards per Day) */}
            <div className="md:hidden space-y-6">
                {WEEKDAYS.map((day, idx) => {
                    const dayIdx = idx;
                    // Skip if today is Saturday/Sunday? No, show all.
                    // Or highlight today.
                    const isToday = (new Date().getDay() || 7) - 1 === dayIdx;

                    return (
                        <Card key={day} className={`overflow-hidden ${isToday ? 'border-primary ring-1 ring-primary' : ''}`}>
                            <CardHeader className="bg-gray-50 py-3 px-4 border-b flex flex-row justify-between items-center">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    {day}요일
                                    {isToday && <Badge className="text-[10px] h-5 px-1.5">오늘</Badge>}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {PERIODS.map(period => {
                                        const data = getSubject(dayIdx, period - 1);
                                        if (!data && !isToday) return null; // Hide empty rows for non-today to save space? Optional.

                                        return (
                                            <div key={period} className="flex items-center p-3 gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-bold text-gray-600 shrink-0">
                                                    {period}
                                                </div>
                                                <div className="flex-1">
                                                    {typeof data === 'string' ? (
                                                        <span className="font-medium text-gray-900">{data}</span>
                                                    ) : typeof data === 'object' && data !== null ? (
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-bold text-gray-900">{data.subject}</span>
                                                            <div className="text-right">
                                                                {data.teacher && <div className="text-xs text-gray-500">{data.teacher}</div>}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-300 text-sm">-</span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    );
}
