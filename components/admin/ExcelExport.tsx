'use client';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";


export default function ExcelExport({ data }: { data: any[] }) {
    const handleExport = async () => {
        // Map data to Korean headers for user friendliness
        const exportData = data.map(user => ({
            '아이디': user.loginId,
            '이름': user.name,
            '역할': user.role, // ADMIN, TEACHER, STUDENT
            '학년': user.grade || '',
            '반': user.class || '',
            '번호': user.number || '',
            '비밀번호': '', // Provided for template re-usability
            '활성상태': user.active ? '활성' : '비활성'
        }));

        const XLSX = (await import('xlsx'));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "사용자목록");

        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const fileName = `사용자_데이터_${new Date().toISOString().split('T')[0]}.xlsx`;
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            엑셀 내보내기
        </Button>
    );
}
