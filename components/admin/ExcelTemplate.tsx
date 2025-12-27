'use client';
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';

export default function ExcelTemplate() {
    const downloadTemplate = () => {
        // Sample data to guide the user

        // Create worksheet using array of arrays to ensure order and header correctness
        const header = ['아이디', '이름', '역할', '학년', '반', '번호', '비밀번호', '활성상태'];
        const data = [
            ['student202401', '홍길동', 'STUDENT', 1, 3, 15, '1234', '활성'],
            ['teacher_kim', '김철수', 'TEACHER', '', '', '', '1234', '활성']
        ];

        const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);

        // Set column widths for better UX
        worksheet['!cols'] = [
            { wch: 15 }, // 아이디
            { wch: 10 }, // 이름
            { wch: 10 }, // 역할
            { wch: 8 },  // 학년
            { wch: 8 },  // 반
            { wch: 8 },  // 번호
            { wch: 12 }, // 비밀번호
            { wch: 10 }  // 활성상태
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "사용자등록_템플릿");

        // Write to buffer and create blob to force download logic which is often more stable
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = "사용자_등록_템플릿.xlsx";
        anchor.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <Button variant="outline" size="sm" onClick={downloadTemplate} className="text-xs">
            <FileSpreadsheet className="w-3 h-3 mr-1" />
            템플릿 다운로드
        </Button>
    );
}
