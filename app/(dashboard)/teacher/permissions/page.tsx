'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Check, X, Loader2, RefreshCw, Search, Trash2 } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface Permission {
    id: string;
    student: { name: string; grade: number; class: number; number: number };
    type: string;
    start: string;
    end: string;
    reason: string;
    status: string;
}



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
    const [sortMethod, setSortMethod] = useState<'DEFAULT' | 'PROCESSED' | 'TIME'>('DEFAULT');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedTerm, setDebouncedTerm] = useState("");

    // Debounce Logic
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        loadPermissions(1, true);
    }, [debouncedTerm]);

    const loadPermissions = async (pageNum: number, reset = false) => {
        if (isFetching && !reset) return;
        setIsFetching(true);
        try {
            const params = new URLSearchParams();
            params.set('page', pageNum.toString());
            params.set('limit', '20');
            if (debouncedTerm) params.set('search', debouncedTerm);

            const res = await fetch(`/api/teacher/permissions?${params.toString()}`);
            const data = await res.json();

            if (reset) {
                setPermissions(data.permissions);
            } else {
                setPermissions(prev => [...prev, ...data.permissions]);
            }

            setHasMore(data.meta.page < data.meta.lastPage);
            setPage(pageNum);
        } catch (e) {
            console.error("Failed to fetch permissions", e);
        }
        setIsFetching(false);
    };

    const handleAction = async (id: string, status: string) => {
        // Optimistic Update
        setPermissions(prev => prev.map(p =>
            p.id === id ? { ...p, status } : p
        ));

        // No loading spinner needed for the button since it changes instantly
        // But we can keep it if we want to show "syncing" status, but "Optimistic" means immediate feedback.
        // Let's remove the loading state for the specific item to make it feel instant, or use it for "syncing".
        // I'll keep `loading` state to prevent double-clicks but NOT block UI feedback excessively.

        try {
            const res = await fetch(`/api/teacher/permissions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (!res.ok) {
                // Revert on failure (optional, but good practice)
                // For now, we assume success. If fail, maybe toast error.
                console.error("Action failed server-side");
            }
        } catch (e) {
            console.error("Action failed", e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("정말 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.")) return;

        // Optimistic Remove
        setPermissions(prev => prev.filter(p => p.id !== id));

        try {
            const res = await fetch(`/api/teacher/permissions/${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                console.error("Delete failed server-side");
                // Ideally refresh or show error
            }
        } catch (e) {
            console.error("Delete failed", e);
        }
    };

    // Sorting Logic (Applied to CLIENT-SIDE list)
    // Note: Sorting paginated data client-side is imperfect but acceptable for "Inbox" style where "Recent" is dominant.
    const sortedPermissions = [...permissions].sort((a, b) => {
        if (sortMethod === 'PROCESSED') {
            const tA = new Date(a.updatedAt || a.createdAt).getTime();
            const tB = new Date(b.updatedAt || b.createdAt).getTime();
            return tB - tA; // Descending
        } else if (sortMethod === 'TIME') {
            const tA = new Date(a.start).getTime();
            const tB = new Date(b.start).getTime();
            return tA - tB; // Ascending
        } else {
            // DEFAULT
            if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
            if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
            if (a.status === 'PENDING' && b.status === 'PENDING') {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            } else {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        }
    });

    return (
        <div className="p-4 md:p-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold whitespace-nowrap">퍼미션 관리</h1>

                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            type="search"
                            placeholder="학생 이름 검색..."
                            className="pl-9 w-full bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <Button
                            variant={sortMethod === 'DEFAULT' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSortMethod('DEFAULT')}
                            className="whitespace-nowrap"
                        >
                            기본순
                        </Button>
                        <Button
                            variant={sortMethod === 'PROCESSED' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSortMethod('PROCESSED')}
                            className="whitespace-nowrap"
                        >
                            처리일순
                        </Button>
                        <Button
                            variant={sortMethod === 'TIME' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSortMethod('TIME')}
                            className="whitespace-nowrap"
                        >
                            시간순
                        </Button>
                        <div className="w-px h-6 bg-gray-300 mx-2 hidden md:block"></div>
                        <Button variant="ghost" size="sm" onClick={() => loadPermissions(1, true)} className="whitespace-nowrap">
                            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                            새로고침
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {sortedPermissions.length === 0 && !isFetching && <p className="text-gray-500 text-center py-8">대기 중인 요청이 없습니다.</p>}

                {sortedPermissions.map(p => (
                    <Card key={p.id} className={`${p.status === 'PENDING' ? 'border-l-4 border-l-blue-500 bg-blue-50/10' : 'opacity-80 hover:opacity-100 transition-opacity'}`}>
                        {/* ... existing Card Content ... */}
                        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-5 gap-4">
                            <div className="space-y-1.5 w-full">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant={p.status === 'PENDING' ? 'default' : (p.status === 'APPROVED' ? 'secondary' : 'destructive')} className="mb-0.5">
                                        {statusMap[p.status] || p.status}
                                    </Badge>
                                    <span className="font-bold text-lg text-gray-900">{p.student.name}</span>
                                    <span className="text-sm text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                        {p.student.grade}-{p.student.class}-{p.student.number}
                                    </span>
                                    {p.status === 'PENDING' && (
                                        <span className="text-[10px] text-gray-400">
                                            {format(new Date(p.createdAt), 'MM/dd HH:mm')} 신청
                                        </span>
                                    )}
                                </div>
                                <div className="text-base text-gray-800 font-medium flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs font-normal border-gray-300">
                                        {typeMap[p.type] || p.type}
                                    </Badge>
                                    <span>
                                        {format(new Date(p.start), 'HH:mm')} ~ {format(new Date(p.end), 'HH:mm')}
                                    </span>
                                    {p.location && <span className="text-blue-600 text-sm">@ {p.location}</span>}
                                </div>
                                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md block w-full sm:w-fit break-keep">
                                    {p.reason}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-end sm:justify-start border-t sm:border-t-0 pt-3 sm:pt-0">
                                {p.status === 'PENDING' ? (
                                    <>
                                        <Button size="sm" onClick={() => handleAction(p.id, 'APPROVED')} className="bg-green-600 hover:bg-green-700 w-full sm:w-20 transition-all active:scale-95">
                                            <Check className="w-4 h-4 mr-1" />
                                            승인
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleAction(p.id, 'REJECTED')} className="w-full sm:w-20 transition-all active:scale-95">
                                            <X className="w-4 h-4 mr-1" /> 반려
                                        </Button>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleAction(p.id, 'PENDING')}
                                            className="text-xs text-gray-400 hover:text-gray-900"
                                        >
                                            상태 되돌리기
                                        </Button>
                                        <div className="h-3 w-px bg-gray-300 mx-1"></div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(p.id)}
                                            className="text-xs text-red-400 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                                            삭제
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
                <div className="mt-6 flex justify-center">
                    <Button variant="secondary" onClick={() => loadPermissions(page + 1)} disabled={isFetching} className="w-full md:w-auto min-w-[200px]">
                        {isFetching ? <Loader2 className="animate-spin mr-2" /> : null}
                        {isFetching ? '로딩 중...' : '더 보기'}
                    </Button>
                </div>
            )}
        </div>
    )
}
