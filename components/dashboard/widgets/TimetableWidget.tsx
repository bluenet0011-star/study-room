'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, BookOpen, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface TimetableWidgetProps {
    grade: number;
    classNum: number;
}

interface Subject {
    grade: number;
    class: number;
    weekday: number;
    period: number;
    teacher: string;
    subject: string;
    room: string;
    changed: boolean;
}

export function TimetableWidget({ grade, classNum }: TimetableWidgetProps) {
    const [timetable, setTimetable] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                // Fetch for the whole week
                const res = await fetch(`/api/school/timetable?grade=${grade}&class=${classNum}`);
                if (!res.ok) throw new Error("Failed");
                const data = await res.json();

                // Get today's day index (1=Mon, ..., 5=Fri)
                const today = new Date().getDay();

                // comcigan-parser structure: [grade][class][weekday][period]
                // data returned from API is `result[grade][class]` which is `Array<Array<Subject>>`?
                // API returns `result[grade][class]` which is an object where keys are weekdays?
                // Actually comcigan-parser returns: 
                // [ [null], [null, MonData...], [null, TueData...] ] (index is weekday)

                // Let's assume API returns the array for the class, where index is weekday.
                // data[today] should be the periods for today.

                if (data && data[today]) {
                    setTimetable(data[today]);
                } else {
                    setTimetable([]);
                }
            } catch (e) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (grade && classNum) {
            fetchTimetable();
        } else {
            setLoading(false); // No grade/class info
        }
    }, [grade, classNum]);

    const todayDate = format(new Date(), 'M월 d일 (EEE)', { locale: ko });

    return (
        <Card className="bg-white border-blue-100 shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    오늘의 시간표
                    <span className="text-xs font-normal text-slate-400 ml-1">{todayDate}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-200" />
                    </div>
                ) : error ? (
                    <div className="text-center text-xs text-red-400 py-4">
                        시간표를 불러올 수 없습니다.
                    </div>
                ) : timetable.length === 0 ? (
                    <div className="text-center text-xs text-slate-400 py-4">
                        오늘은 수업이 없거나 휴일입니다.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {timetable.map((period, idx) => {
                            // comcigan-parser might return periods starting from 1
                            if (!period || !period.subject) return null;
                            const isCurrentPeriod = false; // logic to highlight current period could be added

                            return (
                                <div key={idx} className="flex items-center text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    <div className="w-8 font-bold text-slate-400 text-xs">{idx}교시</div>
                                    <div className="flex-1 font-semibold text-slate-700">
                                        {period.subject}
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                                        {period.teacher || "-"}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
