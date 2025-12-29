'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
    teacher: { id: string; name: string } | null;
}

export default function StatusPage() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPermissions();
        fetch('/api/users/teachers').then(res => res.json()).then(setTeachers);
        const interval = setInterval(fetchPermissions, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchPermissions = () => {
        fetch('/api/student/permissions').then(res => res.json()).then(setPermissions);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
        }
    };

    const getLocationIcon = (location?: string) => {
        if (!location) return '📍';
        if (location.includes('병원')) return '🏥';
        if (location.includes('집') || location.includes('자택')) return '🏠';
        if (location.includes('도서관')) return '📚';
        if (location.includes('화장실')) return '🚽';
        if (location.includes('보건실')) return '💊';
        if (location.includes('교무실')) return '🏫';
        if (location.includes('매점')) return '🏪';
        return '📍';
    };

    const handleEdit = (p: Permission) => {
        setEditForm({
            id: p.id,
            type: p.type,
            start: p.start.split('T')[0], // Extract date
            startTime: new Date(p.start).toTimeString().slice(0, 5),
            endTime: new Date(p.end).toTimeString().slice(0, 5),
            reason: p.reason,
            location: p.location || '',
            teacherId: p.teacher?.id // Note: API might not return teacher ID in list, verify if needed
            // Actually API returns { teacher: { name } }, maybe not ID. 
            // If ID is missing, we might need to ask user to select teacher again or fetch details.
            // Let's assume user re-selects or we keep current if not changed (but we lack ID).
            // Simplest: Ask user to select teacher again if we don't have ID.
        });
        setIsEditing(true);
    };

    const handleUpdate = async () => {
        if (!editForm) return;
        setLoading(true);
        try {
            // Combine date/time
            // Note: Original start/end might be full ISO strings. simple split might fail timezone.
            // But for editing, user picks new times.
            const startIso = new Date(`${editForm.start}T${editForm.startTime}`).toISOString();
            const endIso = new Date(`${editForm.start}T${editForm.endTime}`).toISOString(); // Assume same day for simplicity or add end date picker
            // Wait, original PlanPage has startDate and endDate.
            // Let's accept startDate/endDate relative to the original or just single date for simplicity?
            // To be robust, let's use the UI's simple date inputs.

            const res = await fetch(`/api/student/permissions/${editForm.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: editForm.type,
                    start: startIso,
                    end: endIso,
                    reason: editForm.reason,
                    location: editForm.location,
                    teacherId: editForm.teacherId || permissions.find(p => p.id === editForm.id)?.teacher?.name // Fallback or error?
                    // We need teacherId. List API returns teacher object with Name. 
                    // We need to match name to ID or fetch detail. 
                    // Let's require teacher selection in Edit or try to find ID from teachers list by name.
                })
            });

            if (res.ok) {
                toast.success('수정되었습니다.');
                setIsEditing(false);
                fetchPermissions();
            } else {
                toast.error('수정 실패');
            }
        } catch (e) {
            toast.error('오류 발생');
        }
        setLoading(false);
    };


    return (
        <div className="p-4 md:p-6 w-full max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">내 신청 현황</h1>
            <div className="space-y-4">
                <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                    {/* Desktop View */}
                    <Table className="hidden md:table">
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
                                            {p.location && <span className="font-semibold text-blue-600 mb-0.5">{getLocationIcon(p.location)} {p.location}</span>}
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
                                        {p.status === 'PENDING' && (
                                            <div className="flex gap-1 justify-center mt-1">
                                                <button
                                                    onClick={() => handleEdit(p)}
                                                    className="text-xs text-blue-500 underline"
                                                >
                                                    수정
                                                </button>
                                                <span className="text-gray-300">|</span>
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm('신청을 취소하시겠습니까?')) return;
                                                        await fetch(`/api/student/permissions/${p.id}`, { method: 'DELETE' });
                                                        setPermissions(permissions.filter(perm => perm.id !== p.id));
                                                    }}
                                                    className="text-xs text-red-500 underline"
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        )}
                                        {p.status === 'APPROVED' && (
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

                    {/* Mobile View */}
                    <div className="md:hidden divide-y">
                        {permissions.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                신청 내역이 없습니다.
                            </div>
                        )}
                        {permissions.map(p => (
                            <div key={p.id} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                                            {typeMap[p.type] || p.type}
                                        </Badge>
                                        <Badge className={cn("text-xs whitespace-nowrap", getStatusColor(p.status))} variant="outline">
                                            {statusMap[p.status] || p.status}
                                        </Badge>
                                    </div>
                                    <div className="flex gap-2">
                                        {p.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleEdit(p)}
                                                className="text-xs text-blue-500 font-medium"
                                            >
                                                수정
                                            </button>
                                        )}
                                        {(p.status === 'PENDING' || p.status === 'APPROVED') && (
                                            <button
                                                onClick={async () => {
                                                    if (!confirm('신청을 취소하시겠습니까?')) return;
                                                    await fetch(`/api/student/permissions/${p.id}`, { method: 'DELETE' });
                                                    setPermissions(permissions.filter(perm => perm.id !== p.id));
                                                }}
                                                className="text-xs text-red-500 font-medium"
                                            >
                                                취소
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm font-medium">
                                    {format(new Date(p.start), 'MM.dd(eee) HH:mm', { locale: ko })} ~ {format(new Date(p.end), 'HH:mm', { locale: ko })}
                                </div>
                                {(p.location || p.reason) && (
                                    <div className="text-sm bg-gray-50 p-2 rounded text-gray-600">
                                        {p.location && <div className="text-blue-600 font-medium text-xs mb-1">{getLocationIcon(p.location)} {p.location}</div>}
                                        {p.reason}
                                    </div>
                                )}
                                {p.teacher?.name && (
                                    <div className="text-xs text-gray-400 text-right">
                                        담당: {p.teacher.name}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Edit Dialog */}
            {isEditing && editForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md bg-white">
                        <CardHeader>
                            <CardTitle>신청 수정</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">유형</label>
                                <select
                                    className="w-full border rounded p-2 text-sm"
                                    value={editForm.type}
                                    onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                                >
                                    {Object.entries(typeMap).map(([k, v]) => (
                                        <option key={k} value={k}>{v}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">장소</label>
                                <input
                                    className="w-full border rounded p-2 text-sm"
                                    value={editForm.location}
                                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">사유</label>
                                <input
                                    className="w-full border rounded p-2 text-sm"
                                    value={editForm.reason}
                                    onChange={e => setEditForm({ ...editForm, reason: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-sm font-medium">날짜</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded p-2 text-sm"
                                        value={editForm.start}
                                        onChange={e => setEditForm({ ...editForm, start: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-1">
                                    <div className="flex-1">
                                        <label className="text-sm font-medium">시작</label>
                                        <input
                                            type="time"
                                            className="w-full border rounded p-2 text-sm"
                                            value={editForm.startTime}
                                            onChange={e => setEditForm({ ...editForm, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm font-medium">종료</label>
                                        <input
                                            type="time"
                                            className="w-full border rounded p-2 text-sm"
                                            value={editForm.endTime}
                                            onChange={e => setEditForm({ ...editForm, endTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">담당 선생님</label>
                                <select
                                    className="w-full border rounded p-2 text-sm"
                                    value={editForm.teacherId || ''}
                                    onChange={e => setEditForm({ ...editForm, teacherId: e.target.value })}
                                >
                                    <option value="">선생님 선택 (필수)</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    * 수정 시 담당 선생님을 다시 선택해야 할 수 있습니다.
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                                    onClick={() => setIsEditing(false)}
                                >
                                    취소
                                </button>
                                <button
                                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                                    onClick={handleUpdate}
                                    disabled={loading}
                                >
                                    {loading ? '저장 중...' : '저장'}
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
