'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Helper maps for translation
const typeMap: Record<string, string> = {
    MOVEMENT: '이동',
    OUTING: '외출',
    EARLY_LEAVE: '조퇴',
    OTHER: '기타'
};

const statusMap: Record<string, string> = {
    PENDING: '대기중',
    APPROVED: '승인됨',
    REJECTED: '거절됨'
};

interface Permission {
    id: string;
    type: string;
    status: string;
    start: string;
    end: string;
    reason: string;
    location?: string;
    teacher: { name: string } | null;
}

export default function StatusPage() {
    const [permissions, setPermissions] = useState<Permission[]>([]);

    useEffect(() => {
        fetch('/api/student/permissions').then(res => res.json()).then(setPermissions);
        // Setup socket listener here later
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">내 신청 현황</h1>
            <div className="space-y-4">
                <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                <TableHead className="w-[80px] text-center">유형</TableHead>
                                <TableHead className="w-[180px] text-center">일시</TableHead>
                                <TableHead className="text-center">장소/사유</TableHead>
                                <TableHead className="w-[100px] text-center">담당교사</TableHead>
                                <TableHead className="w-[100px] text-center">상태</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {permissions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                        신청 내역이 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                            {permissions.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                                            {typeMap[p.type] || p.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center text-sm">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{format(new Date(p.start), 'MM.dd(eee) HH:mm', { locale: ko })}</span>
                                            <span className="text-gray-500 text-xs">~ {format(new Date(p.end), 'HH:mm', { locale: ko })}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            {p.location && <span className="font-semibold text-blue-600 mb-0.5">📍 {p.location}</span>}
                                            <span className="text-gray-600 truncate max-w-[150px]" title={p.reason}>{p.reason}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center text-sm">
                                        {p.teacher?.name || '-'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={cn("text-xs whitespace-nowrap", getStatusColor(p.status))} variant="outline">
                                            {statusMap[p.status] || p.status}
                                        </Badge>
                                        {(p.status === 'PENDING' || p.status === 'APPROVED') && (
                                            <button
                                                onClick={async () => {
                                                    if (!confirm('신청을 취소하시겠습니까?')) return;
                                                    await fetch(`/api/student/permissions/${p.id}`, { method: 'DELETE' });
                                                    setPermissions(permissions.filter(perm => perm.id !== p.id));
                                                }}
                                                className="block mt-1 text-xs text-red-500 underline mx-auto"
                                            >
                                                취소
                                            </button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
