'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function TeacherReportsPage() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDownload = async (type: 'PERMISSIONS' | 'ATTENDANCE') => {
        if (!startDate || !endDate) {
            toast.error('시작일과 종료일을 모두 선택해주세요.');
            return;
        }

        setLoading(true);
        try {
            // In a real app, this would call an API with ?start=...&end=...
            // For now, we will simulate the fetch.
            // const res = await fetch(`/api/reports/${type.toLowerCase()}?start=${startDate}&end=${endDate}`);
            // const data = await res.json();

            // Dynamic import xlsx
            const XLSX = (await import('xlsx'));

            // Mock Data Generation for Demo
            const mockData = Array.from({ length: 10 }).map((_, i) => ({
                '날짜': startDate,
                '학생이름': `학생${i + 1}`,
                '학년': 1,
                '반': 1,
                '번호': i + 1,
                '유형': type === 'PERMISSIONS' ? '외출' : '자습',
                '상세': type === 'PERMISSIONS' ? '병원 진료' : '야간 자습',
                '시간': '19:00 ~ 21:00'
            }));

            const worksheet = XLSX.utils.json_to_sheet(mockData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "리포트");

            XLSX.writeFile(workbook, `${type}_${startDate}_${endDate}.xlsx`);
            toast.success('다운로드가 시작되었습니다.');
        } catch (e) {
            console.error(e);
            toast.error('다운로드 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">리포트 다운로드</h1>
                <p className="text-gray-500">기간별 학생들의 활동 기록을 엑셀로 다운로드합니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>날짜 선택</CardTitle>
                        <CardDescription>조회할 기간을 설정하세요.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>시작일</Label>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>종료일</Label>
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>항목 선택</CardTitle>
                        <CardDescription>다운로드할 데이터를 선택하세요.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <Button
                            variant="outline"
                            className="w-full justify-between h-14"
                            onClick={() => handleDownload('PERMISSIONS')}
                            disabled={loading}
                        >
                            <span className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-blue-500" />
                                외출/이동 신청 기록
                            </span>
                            <Download className="w-4 h-4 opacity-50" />
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full justify-between h-14"
                            onClick={() => handleDownload('ATTENDANCE')} // Future: QR Attendance
                            disabled={loading}
                        >
                            <span className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-green-500" />
                                행사/QR 출석 기록
                            </span>
                            <Download className="w-4 h-4 opacity-50" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
