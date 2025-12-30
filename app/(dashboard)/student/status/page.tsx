'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Home, Stethoscope, Library, School, Store, Edit2, Trash2, X, Save, Loader2 } from 'lucide-react';
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
    createdAt: string; // Added field
}

export default function StatusPage() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL'); // Filter state

    useEffect(() => {
        fetchPermissions();
        fetch('/api/users/teachers').then(res => res.json()).then(setTeachers);
        const interval = setInterval(fetchPermissions, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchPermissions = () => {
        // Assuming backend sends createdAt. If not, sorting might rely on ID or Start time.
        fetch('/api/student/permissions').then(res => res.json()).then(data => {
            // Sort by createdAt desc locally if not sorted by backend
            const sorted = data.sort((a: any, b: any) =>
                new Date(b.createdAt || b.start).getTime() - new Date(a.createdAt || a.start).getTime()
            );
            setPermissions(sorted);
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
        }
    };

    const getLocationIcon = (location?: string) => {
        if (!location) return <MapPin className="w-4 h-4" />;
        if (location.includes('병원') || location.includes('보건')) return <Stethoscope className="w-4 h-4" />;
        if (location.includes('집') || location.includes('자택')) return <Home className="w-4 h-4" />;
        if (location.includes('도서관') || location.includes('독서')) return <Library className="w-4 h-4" />;
        if (location.includes('매점')) return <Store className="w-4 h-4" />;
        if (location.includes('교무실')) return <School className="w-4 h-4" />;
        return <MapPin className="w-4 h-4" />;
    };

    const handleEdit = (p: Permission) => {
        setEditForm({
            id: p.id,
            type: p.type,
            start: p.start.split('T')[0],
            startTime: new Date(p.start).toTimeString().slice(0, 5),
            endTime: new Date(p.end).toTimeString().slice(0, 5),
            reason: p.reason,
            location: p.location || '',
            teacherId: p.teacher?.id
        });
        setIsEditing(true);
    };

    const handleUpdate = async () => {
        if (!editForm) return;
        setLoading(true);
        try {
            const startIso = new Date(`${editForm.start}T${editForm.startTime}`).toISOString();
            const endIso = new Date(`${editForm.start}T${editForm.endTime}`).toISOString();

            const res = await fetch(`/api/student/permissions/${editForm.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: editForm.type,
                    start: startIso,
                    end: endIso,
                    reason: editForm.reason,
                    location: editForm.location,
                    teacherId: editForm.teacherId || permissions.find(p => p.id === editForm.id)?.teacher?.id
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

    const filteredPermissions = permissions.filter(p => statusFilter === 'ALL' || p.status === statusFilter);

    return (
        <div className="p-4 md:p-6 w-full max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">내 신청 현황</h1>

            {/* Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <Button variant={statusFilter === 'ALL' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('ALL')}>전체</Button>
                <Button variant={statusFilter === 'PENDING' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('PENDING')}>대기중</Button>
                <Button variant={statusFilter === 'APPROVED' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('APPROVED')}>승인됨</Button>
                <Button variant={statusFilter === 'REJECTED' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('REJECTED')}>반려됨</Button>
            </div>

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
                            {filteredPermissions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                        신청 내역이 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                            {filteredPermissions.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                                            {typeMap[p.type] || p.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center text-sm">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-1 text-gray-900">
                                                <span className="font-semibold w-8 text-right text-xs text-gray-500">시작</span>
                                                <span>{format(new Date(p.start), 'MM.dd HH:mm', { locale: ko })}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-900">
                                                <span className="font-semibold w-8 text-right text-xs text-gray-500">종료</span>
                                                <span>{format(new Date(p.end), 'MM.dd HH:mm', { locale: ko })}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            {p.location && <span className="font-semibold text-blue-600 mb-0.5 flex items-center gap-1">{getLocationIcon(p.location)} {p.location}</span>}
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
                                            <div className="flex gap-1 justify-center mt-2">
                                                <Button size="sm" variant="ghost" onClick={() => handleEdit(p)} className="h-6 w-6 p-0 hover:text-blue-600">
                                                    <Edit2 className="w-3 h-3" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={async () => {
                                                    if (!window.confirm('정말 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.')) return;
                                                    await fetch(`/api/student/permissions/${p.id}`, { method: 'DELETE' });
                                                    setPermissions(prev => prev.filter(perm => perm.id !== p.id));
                                                }} className="h-6 w-6 p-0 hover:text-red-600">
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        )}
                                        {p.status === 'APPROVED' && (
                                            <div className="flex justify-center mt-2">
                                                <Button size="sm" variant="ghost" onClick={async () => {
                                                    if (!window.confirm('이미 승인된 신청입니다. 정말 취소하시겠습니까?')) return;
                                                    await fetch(`/api/student/permissions/${p.id}`, { method: 'DELETE' });
                                                    setPermissions(prev => prev.filter(perm => perm.id !== p.id));
                                                }} className="h-6 w-6 p-0 hover:text-red-600">
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Mobile View */}
                    <div className="md:hidden divide-y">
                        {filteredPermissions.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                신청 내역이 없습니다.
                            </div>
                        )}
                        {filteredPermissions.map(p => (
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
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(p)} className="h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-50">
                                                <Edit2 className="w-3 h-3 mr-1" /> 수정
                                            </Button>
                                        )}
                                        {(p.status === 'PENDING' || p.status === 'APPROVED') && (
                                            <Button size="sm" variant="outline" onClick={async () => {
                                                if (!confirm('신청을 취소하시겠습니까?')) return;
                                                await fetch(`/api/student/permissions/${p.id}`, { method: 'DELETE' });
                                                setPermissions(permissions.filter(perm => perm.id !== p.id));
                                            }} className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50">
                                                <Trash2 className="w-3 h-3 mr-1" /> 취소
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm font-medium">
                                    {format(new Date(p.start), 'MM.dd(eee) HH:mm', { locale: ko })} ~ {format(new Date(p.end), 'HH:mm', { locale: ko })}
                                </div>
                                {(p.location || p.reason) && (
                                    <div className="text-sm bg-gray-50 p-2 rounded text-gray-600">
                                        {p.location && <div className="text-blue-600 font-medium text-xs mb-1 flex items-center gap-1">{getLocationIcon(p.location)} {p.location}</div>}
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
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium">날짜</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded p-2 text-sm"
                                        value={editForm.start}
                                        onChange={e => setEditForm({ ...editForm, start: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-sm font-medium">시작</label>
                                        <input
                                            type="time"
                                            className="w-full border rounded p-2 text-sm"
                                            value={editForm.startTime}
                                            onChange={e => setEditForm({ ...editForm, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div>
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
                                <Button variant="ghost" onClick={() => setIsEditing(false)}>취소</Button>
                                <Button onClick={handleUpdate} disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    저장
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
