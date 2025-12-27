'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Check, X, Loader2 } from 'lucide-react';

interface Permission {
    id: string;
    student: { name: string; grade: number; class: number; number: number };
    type: string;
    start: string;
    end: string;
    reason: string;
    status: string;
}

import { useSocket } from '@/components/providers/SocketProvider';

// Helper maps
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

export default function PermissionInboxPage() {
    const [permissions, setPermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState<string | null>(null);
    const socket = useSocket();

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = () => {
        fetch('/api/teacher/permissions').then(res => res.json()).then(setPermissions);
    };

    const handleAction = async (id: string, status: string) => {
        setLoading(id);
        try {
            const res = await fetch(`/api/teacher/permissions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                const updated = await res.json();
                if (socket) {
                    socket.emit('PERMISSION_UPDATE', {
                        id: updated.id,
                        status: updated.status,
                        studentId: updated.studentId,
                        teacherId: updated.teacherId,
                        studentName: updated.student?.name
                    });
                }
                fetchPermissions();
            }
        } catch (e) {
            console.error("Action failed", e);
        }
        setLoading(null);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">퍼미션 수신함</h1>
            <div className="grid gap-4">
                {permissions.length === 0 && <p className="text-gray-500">대기 중인 요청이 없습니다.</p>}
                {permissions.map(p => (
                    <Card key={p.id} className={p.status === 'PENDING' ? 'border-blue-200 bg-blue-50/20' : ''}>
                        <CardContent className="flex items-center justify-between p-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-lg">{p.student.name}</span>
                                    <span className="text-sm text-gray-500">
                                        {p.student.grade}-{p.student.class}-{p.student.number}
                                    </span>
                                    <Badge variant="outline">{typeMap[p.type] || p.type}</Badge>
                                </div>
                                <div className="text-sm text-gray-700 font-medium">
                                    {p.location && <span className="mr-2 text-blue-600">[{p.location}]</span>}
                                    {format(new Date(p.start), 'HH:mm')} ~ {format(new Date(p.end), 'HH:mm')}
                                </div>
                                <p className="text-xs text-gray-500">
                                    {p.reason}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {p.status === 'PENDING' ? (
                                    <>
                                        <Button size="sm" onClick={() => handleAction(p.id, 'APPROVED')} disabled={!!loading} className="bg-green-600 hover:bg-green-700">
                                            {loading === p.id ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
                                            승인
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleAction(p.id, 'REJECTED')} disabled={!!loading}>
                                            <X className="w-4 h-4" /> 반려
                                        </Button>
                                    </>
                                ) : (
                                    <Badge variant={p.status === 'APPROVED' ? 'default' : 'destructive'}>
                                        {statusMap[p.status] || p.status}
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
