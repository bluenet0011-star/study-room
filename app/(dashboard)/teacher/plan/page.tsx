'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
    const [pendingPermissions, setPendingPermissions] = useState<any[]>([]);
    const [historyPermissions, setHistoryPermissions] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            // Fetch ALL permissions for this teacher
            const res = await fetch('/api/teacher/permissions');
            const data = await res.json();

            setPendingPermissions(data.filter((p: any) => p.status === 'PENDING'));
            const history = data.filter((p: any) => p.status !== 'PENDING');
            setHistoryPermissions(history);
            setFilteredHistory(history);
        } catch (e) {
            console.error(e);
            toast.error("데이터를 불러오는데 실패했습니다.");
        }
        setLoading(false);
    };

    const handleSearch = () => {
        if (!search.trim()) {
            setFilteredHistory(historyPermissions);
            return;
        }
        const lower = search.toLowerCase();
        const filtered = historyPermissions.filter(r =>
            r.student.name.includes(lower) ||
            (r.student.grade + '').includes(lower)
        );
        setFilteredHistory(filtered);
    };

    const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        setProcessingId(id);
        try {
            const res = await fetch(`/api/teacher/permissions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                toast.success(status === 'APPROVED' ? '승인처리 되었습니다.' : '반려처리 되었습니다.');
                await fetchPermissions();
            } else {
                toast.error("처리에 실패했습니다.");
            }
        } catch (e) {
            console.error(e);
            toast.error("네트워크 오류가 발생했습니다.");
        }
        setProcessingId(null);
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin w-8 h-8 text-gray-400" /></div>;

    return (
        <div className="p-6 space-y-8">
            {/* 1. Pending Permissions Section */}
            <div>
                <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    신규 신청 목록
                    {pendingPermissions.length > 0 && (
                        <Badge variant="destructive" className="rounded-full px-2">
                            {pendingPermissions.length}
                        </Badge>
                    )}
                </h1>

                {pendingPermissions.length === 0 ? (
                    <Card className="bg-gray-50 border-dashed">
                        <CardContent className="h-32 flex items-center justify-center text-gray-500">
                            대기 중인 신청이 없습니다.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {pendingPermissions.map((record) => (
                            <Card key={record.id} className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{record.student.name}</CardTitle>
                                            <p className="text-sm text-gray-500">
                                                {record.student.grade}학년 {record.student.class}반 {record.student.number}번
                                            </p>
                                        </div>
                                        <Badge>{typeMap[record.type]}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="text-sm bg-gray-50 p-3 rounded-md space-y-1">
                                            <p><span className="font-semibold">일시:</span> {format(new Date(record.start), 'MM.dd HH:mm', { locale: ko })} ~ {format(new Date(record.end), 'HH:mm', { locale: ko })}</p>
                                            {record.location && <p><span className="font-semibold">장소:</span> {record.location}</p>}
                                            <p><span className="font-semibold">사유:</span> {record.reason}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                                onClick={() => handleAction(record.id, 'APPROVED')}
                                                disabled={!!processingId}
                                            >
                                                {processingId === record.id ? <Loader2 className="w-4 h-4 animate-spin" /> : '승인'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                                                onClick={() => handleAction(record.id, 'REJECTED')}
                                                disabled={!!processingId}
                                            >
                                                반려
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <div className="border-t pt-8"></div>

            {/* 2. History Section */}
            <div>
                <h1 className="text-2xl font-bold mb-4">지난 이력 (History)</h1>

                <div className="flex gap-2 mb-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="학생 이름 검색..."
                            className="pl-9"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Button onClick={handleSearch} variant="secondary">검색</Button>
                </div>

                <Card>
                    <CardContent className="p-0">
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
                                {filteredHistory.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                                            기록이 없습니다.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filteredHistory.map((record) => (
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
        </div>
    );
}
