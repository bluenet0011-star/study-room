'use client';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function ExcelImport() {
    const router = useRouter();
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
                const wb = XLSX.read(bstr, { type: 'array' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const rawData = XLSX.utils.sheet_to_json(ws) as any[];

                // Helper to safely get value from row with fuzzy key matching
                const getValue = (row: any, key: string) => {
                    const foundKey = Object.keys(row).find(k => k.trim() === key);
                    return foundKey ? row[foundKey] : undefined;
                };

                const mapRole = (raw: any) => {
                    const val = (raw || '').toString().trim();
                    if (['학생', 'STUDENT'].includes(val.toUpperCase())) return 'STUDENT';
                    if (['교사', '선생님', 'TEACHER'].includes(val.toUpperCase())) return 'TEACHER';
                    if (['관리자', 'ADMIN'].includes(val.toUpperCase())) return 'ADMIN';
                    return 'STUDENT';
                };

                // Map Korean headers to English fields expected by API
                const mappedData = rawData.map(row => ({
                    loginId: (getValue(row, '아이디') || '').toString().trim(),
                    name: getValue(row, '이름'),
                    role: mapRole(getValue(row, '역할')),
                    grade: getValue(row, '학년'),
                    class: getValue(row, '반'),
                    number: getValue(row, '번호'),
                    password: (getValue(row, '비밀번호') || '').toString().trim(),
                    active: getValue(row, '활성상태') !== '비활성'
                })).filter(user => user.loginId && user.name);

                if (mappedData.length === 0) {
                    toast.error("업로드할 수 있는 사용자 데이터가 없습니다. 형식을 확인하세요.");
                    setLoading(false);
                    return;
                }

                // Send to API
                const res = await fetch('/api/admin/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ users: mappedData })
                });

                if (res.ok) {
                    toast.success(`${mappedData.length}명의 사용자 정보가 성공적으로 반영되었습니다.`);
                    router.refresh();
                } else {
                    toast.error("업로드 중 서버 오류가 발생했습니다.");
                }
            } catch (err) {
                console.error("Excel import error", err);
                toast.error("파일 형식이 올바르지 않습니다.");
            }
            setLoading(false);
        };
        reader.readAsArrayBuffer(file);
    };

    const fileInputRef = useState<HTMLInputElement | null>(null); // Actually better to use useRef
    // But since I can't change imports easily with replace_file_content if I need to add useRef... 
    // Wait, I can allow multiple edits or just rewrite the component start.
    // I need `useRef`. I will rewrite the component imports and body.

    // Actually, I will just rewrite the return statement and add useRef hook. I need to add `useRef` to imports first.
    // I'll do it in valid steps.
    return (
        <div className="flex items-center gap-2">
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
                id="excel-upload-input"
                disabled={loading}
            />
            <Button disabled={loading} variant="secondary" onClick={() => document.getElementById('excel-upload-input')?.click()}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                엑셀 업로드
            </Button>
        </div>
    );
}
