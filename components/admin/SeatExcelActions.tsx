'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Upload, Download, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface SeatExcelActionsProps {
    roomId: string;
    onSuccess: () => void;
}

export function SeatExcelActions({ roomId, onSuccess }: SeatExcelActionsProps) {
    const [loading, setLoading] = useState(false);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [confirmData, setConfirmData] = useState<any[] | null>(null);

    const handleDownloadTemplate = async () => {
        // Fetch current seats to include in template
        const res = await fetch(`/api/admin/rooms/${roomId}/seats`);
        if (!res.ok) {
            toast.error("좌석 정보를 불러오는데 실패했습니다.");
            return;
        }
        const seats = await res.json();

        // Create template data
        // Format: Seat Label | Student Name | Student Number (Grade-Class-Num) | Student ID (LoginId)
        const templateData = seats.map((seat: any) => ({
            '좌석번호': seat.label,
            '학생이름': '',
            '학번(학년-반-번호)': '', // e.g., 30514 or 3-5-14
            '아이디(선택)': ''
        })).sort((a: any, b: any) => parseInt(a['좌석번호']) - parseInt(b['좌석번호']));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(templateData);
        // Add column widths
        ws['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 20 }];

        XLSX.utils.book_append_sheet(wb, ws, "좌석배정");
        XLSX.writeFile(wb, "좌석배정_템플릿.xlsx");
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json(ws) as any[];

                // Validation Phase
                // We need to check if students exist.
                // We'll send the data to the server for validation.
                const res = await fetch(`/api/admin/rooms/${roomId}/assignments/validate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data })
                });

                const result = await res.json();

                if (!res.ok) {
                    toast.error(result.error || "검증 중 오류가 발생했습니다.");
                    setLoading(false);
                    return;
                }

                if (result.warnings && result.warnings.length > 0) {
                    setWarnings(result.warnings);
                    setConfirmData(result.validData);
                } else if (result.validData.length > 0) {
                    // No warnings, proceed directly
                    await executeAssignment(result.validData);
                } else {
                    toast.info("적용할 데이터가 없습니다.");
                    setLoading(false);
                }

            } catch (err) {
                console.error(err);
                toast.error("파일 처리 중 오류가 발생했습니다.");
                setLoading(false);
            }
        };
        reader.readAsArrayBuffer(file);
        // Reset input
        e.target.value = '';
    };

    const executeAssignment = async (data: any[]) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/rooms/${roomId}/assignments/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignments: data })
            });

            if (res.ok) {
                toast.success("좌석 배정이 완료되었습니다.");
                setConfirmData(null);
                setWarnings([]);
                onSuccess();
            } else {
                toast.error("저장 중 오류가 발생했습니다.");
            }
        } catch (e) {
            toast.error("서버 연결 오류");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2">
            <Dialog open={!!confirmData} onOpenChange={(o) => !o && setConfirmData(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle /> 확인 필요
                        </DialogTitle>
                        <DialogDescription>
                            다음과 같은 경고가 있습니다. 계속 진행하시겠습니까?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[300px] overflow-auto bg-gray-50 p-4 rounded text-sm space-y-1">
                        {warnings.map((w, i) => (
                            <p key={i} className="text-gray-700">• {w}</p>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmData(null)}>취소</Button>
                        <Button onClick={() => confirmData && executeAssignment(confirmData)}>
                            무시하고 진행
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={handleDownloadTemplate} disabled={loading}>
                <Download className="w-4 h-4 mr-2" /> 템플릿 다운로드
            </Button>

            <div className="relative">
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="seat-excel-upload"
                    disabled={loading}
                />
                <Button variant="secondary" onClick={() => document.getElementById('seat-excel-upload')?.click()} disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    엑셀 배정 업로드
                </Button>
            </div>
        </div>
    );
}
