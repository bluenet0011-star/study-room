'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Search, Loader2, Plus, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PermissionForm } from '@/components/forms/PermissionForm';

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

    // Bulk Create States
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [bulkSearch, setBulkSearch] = useState('');
    const [bulkSearchResults, setBulkSearchResults] = useState<any[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
    const [bulkForm, setBulkForm] = useState({
        type: 'MOVEMENT',
        date: new Date().toISOString().split('T')[0],
        startTime: '18:00',
        endTime: '21:00',
        location: '',
        reason: ''
    });
    const [bulkLoading, setBulkLoading] = useState(false);

    useEffect(() => {
        fetchPermissions();
    }, []);


    // Bulk Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (bulkSearch.trim()) {
                fetch(`/api/admin/students/search?query=${encodeURIComponent(bulkSearch)}`)
                    .then(res => res.json())
                    .then(setBulkSearchResults)
                    .catch(console.error);
            } else {
                setBulkSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [bulkSearch]);

    const handleBulkSubmit = async () => {
        if (selectedStudents.length === 0) {
            toast.error("학생을 선택해주세요.");
            return;
        }
        if (!bulkForm.location || !bulkForm.reason) {
            toast.error("장소와 사유를 입력해주세요.");
            return;
        }

        setBulkLoading(true);
        try {
            const startStr = `${bulkForm.date}T${bulkForm.startTime}`;
            const endStr = `${bulkForm.date}T${bulkForm.endTime}`;

            const res = await fetch('/api/teacher/permissions/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentIds: selectedStudents.map(s => s.id),
                    type: bulkForm.type,
                    start: new Date(startStr).toISOString(),
                    end: new Date(endStr).toISOString(),
                    reason: bulkForm.reason,
                    location: bulkForm.location
                })
            });

            if (res.ok) {
                toast.success(`${selectedStudents.length}명의 퍼미션이 등록되었습니다.`);
                setIsBulkOpen(false);
                setBulkForm({ ...bulkForm, reason: '', location: '' }); // Reset fields
                setSelectedStudents([]);
                fetchPermissions(); // Refresh list
            } else {
                toast.error("일괄 등록에 실패했습니다.");
            }
        } catch (e) {
            console.error(e);
            toast.error("오류가 발생했습니다.");
        }
        setBulkLoading(false);
    };

    const toggleStudent = (student: any) => {
        if (selectedStudents.find(s => s.id === student.id)) {
            setSelectedStudents(selectedStudents.filter(s => s.id !== student.id));
        } else {
            setSelectedStudents([...selectedStudents, student]);
        }
    };

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const [pendingRes, historyRes] = await Promise.all([
                fetch('/api/teacher/permissions'),
                fetch('/api/teacher/permissions/history')
            ]);

            if (pendingRes.ok) {
                const data = await pendingRes.json();
                // API returns { permissions: [], meta: {} }
                const list = data.permissions || [];
                setPendingPermissions(list.filter((p: any) => p.status === 'PENDING'));
            }

            if (historyRes.ok) {
                const data = await historyRes.json();
                // Sort by ID desc (Application Order proxy)
                const sorted = data.sort((a: any, b: any) => b.id.localeCompare(a.id));
                setHistoryPermissions(sorted);
                if (!search) setFilteredHistory(sorted);
            }
        } catch (error) {
            console.error(error);
            toast.error("데이터를 불러오는데 실패했습니다.");
        }
        setLoading(false);
    };

    const handleAction = async (id: string, status: string) => {
        setProcessingId(id);
        try {
            const res = await fetch(`/api/teacher/permissions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                toast.success(status === 'APPROVED' ? "승인되었습니다." : "반려되었습니다.");
                fetchPermissions();
            } else {
                toast.error("처리 실패");
            }
        } catch (e) {
            toast.error("오류가 발생했습니다.");
        }
        setProcessingId(null);
    };

    const [historyStatusFilter, setHistoryStatusFilter] = useState('ALL');
    const [historyDateRange, setHistoryDateRange] = useState({ start: '', end: '' });

    // ... (existing states)

    // ... (existing useEffects)

    // Re-run filtering when dependencies change
    useEffect(() => {
        filterHistory();
    }, [search, historyStatusFilter, historyDateRange, historyPermissions]);

    const filterHistory = () => {
        let filtered = [...historyPermissions];

        // 1. Search Query
        if (search.trim()) {
            const query = search.toLowerCase();
            filtered = filtered.filter(p =>
                p.student.name.toLowerCase().includes(query) ||
                (p.location && p.location.toLowerCase().includes(query)) ||
                (p.reason && p.reason.toLowerCase().includes(query))
            );
        }

        // 2. Status Filter
        if (historyStatusFilter !== 'ALL') {
            filtered = filtered.filter(p => p.status === historyStatusFilter);
        }

        // 3. Date Range Filter
        if (historyDateRange.start) {
            filtered = filtered.filter(p => p.start >= `${historyDateRange.start}T00:00:00`);
        }
        if (historyDateRange.end) {
            filtered = filtered.filter(p => p.end <= `${historyDateRange.end}T23:59:59`);
        }

        setFilteredHistory(filtered);
    };

    // ... (rest of component until return)

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin w-8 h-8 text-gray-400" /></div>;

    return (
        <div className="p-6 space-y-8">
            {/* Header & Bulk Button */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    신규 신청 목록
                    {pendingPermissions.length > 0 && (
                        <Badge variant="destructive" className="rounded-full px-2">
                            {pendingPermissions.length}
                        </Badge>
                    )}
                </h1>

                <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                            <Plus className="w-4 h-4" />
                            퍼미션 대리 신청
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogHeader>
                                <DialogTitle>퍼미션 대리 신청 (교사 권한)</DialogTitle>
                            </DialogHeader>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* 1. Student Selection */}
                            <div className="space-y-3 p-4 border rounded-lg bg-gray-50/50">
                                <Label className="text-base font-semibold">1. 학생 선택 ({selectedStudents.length}명)</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="이름 검색..."
                                        className="pl-9 bg-white"
                                        value={bulkSearch}
                                        onChange={e => setBulkSearch(e.target.value)}
                                    />
                                </div>
                                {bulkSearchResults.length > 0 && (
                                    <div className="max-h-40 overflow-y-auto border rounded-md bg-white p-2 space-y-1">
                                        {bulkSearchResults.map(s => {
                                            const isSelected = selectedStudents.some(sel => sel.id === s.id);
                                            return (
                                                <div
                                                    key={s.id}
                                                    className={cn("flex items-center justify-between p-2 rounded cursor-pointer", isSelected ? "bg-green-50 border border-green-200" : "hover:bg-gray-50")}
                                                    onClick={() => toggleStudent(s)}
                                                >
                                                    <span className={cn("text-sm", isSelected && "font-bold text-green-700")}>{s.grade}-{s.class}-{s.number} {s.name}</span>
                                                    {isSelected && <Check className="w-4 h-4 text-green-600" />}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                                {/* Selected Tags */}
                                {selectedStudents.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {selectedStudents.map(s => (
                                            <Badge key={s.id} variant="secondary" className="gap-1 bg-white border cursor-pointer hover:bg-red-50" onClick={() => toggleStudent(s)}>
                                                {s.name} <X className="w-3 h-3" />
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 2. Permission Details */}
                            <div className="space-y-4 p-4 border rounded-lg bg-white">
                                <Label className="text-base font-semibold">2. 퍼미션 내용</Label>
                                <PermissionForm
                                    onSubmit={async () => { }} // Handled by parent button
                                    onChange={(data) => setBulkForm(prev => ({ ...prev, ...data }))}
                                    showTeacherSelect={false}
                                    hideSubmitButton={true}
                                    initialData={bulkForm}
                                />
                            </div>

                            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleBulkSubmit} disabled={bulkLoading}>
                                {bulkLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                {selectedStudents.length}명 일괄 등록 및 승인
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Pending List (Original) */}
            <div>

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
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 h-9 text-sm"
                                                onClick={() => handleAction(record.id, 'APPROVED')}
                                                disabled={!!processingId}
                                            >
                                                {processingId === record.id ? <Loader2 className="w-4 h-4 animate-spin" /> : '승인'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 h-9 text-sm"
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
                <h1 className="text-2xl font-bold mb-4">Permission History</h1>

                <div className="flex gap-2 mb-4">
                    <div className="flex flex-wrap gap-2 items-center flex-1">
                        <div className="relative max-w-sm min-w-[200px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="학생 이름, 장소, 사유 검색..."
                                className="pl-9"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        <Select value={historyStatusFilter} onValueChange={setHistoryStatusFilter}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="상태" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">전체 상태</SelectItem>
                                <SelectItem value="PENDING">대기중</SelectItem>
                                <SelectItem value="APPROVED">승인됨</SelectItem>
                                <SelectItem value="REJECTED">반려됨</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-1 border rounded-md px-2 py-1 bg-white">
                            <span className="text-sm text-gray-500">기간:</span>
                            <Input
                                type="date"
                                className="h-8 w-32 border-0 p-0 focus-visible:ring-0"
                                value={historyDateRange.start}
                                onChange={e => setHistoryDateRange(prev => ({ ...prev, start: e.target.value }))}
                            />
                            <span className="text-gray-400">~</span>
                            <Input
                                type="date"
                                className="h-8 w-32 border-0 p-0 focus-visible:ring-0"
                                value={historyDateRange.end}
                                onChange={e => setHistoryDateRange(prev => ({ ...prev, end: e.target.value }))}
                            />
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSearch('');
                                setHistoryStatusFilter('ALL');
                                setHistoryDateRange({ start: '', end: '' });
                            }}
                            className="bg-white hover:bg-gray-50"
                        >
                            <X className="w-3 h-3 mr-1" />
                            초기화
                        </Button>
                    </div>
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
