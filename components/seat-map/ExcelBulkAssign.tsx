'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

interface ExcelRow {
    SeatLabel: string | number;
    StudentName: string;
}

export function ExcelBulkAssign({ roomId, onUpdate }: { roomId: string, onUpdate: () => void }) {
    const [loading, setLoading] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const XLSX = (await import('xlsx'));
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json<ExcelRow>(ws);

                if (data.length === 0) {
                    toast.error("데이터가 없습니다.");
                    setLoading(false);
                    return;
                }

                // Transform keys if necessary (insensitive check)
                // We expect columns: "Seat Label", "Student Name" (or similar)
                // Let's normalize keys
                const assignments = data.map((row: any) => {
                    const keys = Object.keys(row);
                    const labelKey = keys.find(k => k.replace(/\s+/g, '').toLowerCase().includes('label') || k.includes('좌석'));
                    const nameKey = keys.find(k => k.replace(/\s+/g, '').toLowerCase().includes('name') || k.includes('이름'));

                    if (!labelKey || !nameKey) return null;

                    return {
                        seatLabel: String(row[labelKey]),
                        studentName: String(row[nameKey])
                    };
                }).filter(Boolean);

                if (assignments.length === 0) {
                    toast.error("올바른 컬럼(좌석번호, 학생이름)을 찾을 수 없습니다.");
                    setLoading(false);
                    return;
                }

                const res = await fetch('/api/admin/seats/bulk-assign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roomId, assignments })
                });

                const result = await res.json();
                if (res.ok) {
                    toast.success(`${result.successCount}개의 좌석이 배정되었습니다.`);
                    if (result.errors.length > 0) {
                        console.warn('Errors:', result.errors);
                        toast.warning(`${result.errors.length}건의 실패가 있습니다 (콘솔 확인)`);
                    }
                    onUpdate();
                } else {
                    toast.error(result.error || "배정 실패");
                }

            } catch (e) {
                console.error(e);
                toast.error("파일 처리 중 오류가 발생했습니다.");
            }
            setLoading(false);
            e.target.value = ''; // Reset input
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="relative">
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
                id="excel-upload-seats"
                disabled={loading}
            />
            <label htmlFor="excel-upload-seats">
                <Button variant="outline" size="sm" className="cursor-pointer" asChild disabled={loading}>
                    <span>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
                        엑셀 일괄 배정
                    </span>
                </Button>
            </label>
        </div>
    );
}
