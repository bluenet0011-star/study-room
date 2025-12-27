'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Search } from 'lucide-react';

const typeMap: Record<string, string> = {
    MOVEMENT: '이동',
    OUTING: '외출',
    EARLY_LEAVE: '조퇴',
    OTHER: '기타'
};

const statusMap: Record<string, string> = {
    PENDING: '대기중',
    APPROVED: '승인됨',
    REJECTED: '반려됨'
};

export default function TeacherPlanPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [filteredRecords, setFilteredRecords] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/teacher/permissions/history').then(res => res.json()).then(data => {
            setRecords(data);
            setFilteredRecords(data);
        });
    }, []);

    const handleSearch = () => {
        if (!search.trim()) {
            setFilteredRecords(records);
            return;
        }
        const lower = search.toLowerCase();
        const filtered = records.filter(r =>
            r.student.name.includes(lower) ||
            (r.student.grade + '').includes(lower)
        );
        setFilteredRecords(filtered);
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">학습관리 (전체 이력)</h1>

            <div className="flex gap-2 mb-4">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="전체 학생 이름 검색..."
                        className="pl-9"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <Button onClick={handleSearch}>검색</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>퍼미션 활동 이력</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                <TableHead className="w-[150px]">학생 정보</TableHead>
                                <TableHead className="w-[100px] text-center">유형</TableHead>
                                <TableHead className="text-center">시간/장소</TableHead>
                                <TableHead className="w-[100px] text-center">상태</TableHead>
                                <TableHead className="w-[100px] text-center">처리일</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRecords.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                                        기록이 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                            {filteredRecords.map((record) => (
                                <TableRow key={record.id} className="hover:bg-gray-50">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">{record.student.name}</span>
                                            <span className="text-xs text-gray-500">
                                                {record.student.grade}학년 {record.student.class}반 {record.student.number}번
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline">{typeMap[record.type] || record.type}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-medium">
                                                {format(new Date(record.start), 'MM.dd HH:mm', { locale: ko })} ~ {format(new Date(record.end), 'HH:mm', { locale: ko })}
                                            </span>
                                            {record.location && <span className="text-xs text-blue-600 mt-0.5">[{record.location}]</span>}
                                            <span className="text-xs text-gray-400 truncate max-w-[200px]">{record.reason}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={record.status === 'APPROVED' ? 'default' : 'secondary'}>
                                            {statusMap[record.status] || record.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center text-sm text-gray-500">
                                        {format(new Date(record.updatedAt), 'MM.dd', { locale: ko })}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
