'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Search, PenSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface Notice {
    id: string;
    title: string;
    author: { name: string };
    createdAt: string;
    important: boolean;
}

export default function NoticePage() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async (query = '') => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/notices?search=${query}`);
            const data = await res.json();
            setNotices(data.notices);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        fetchNotices(search);
    };

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">공지사항</h1>
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="제목 검색"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-8"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleSearch} className="flex-1 md:flex-none">검색</Button>
                        {(session?.user?.role === 'ADMIN' || session?.user?.role === 'TEACHER') && (
                            <Link href="/notice/write" className="flex-1 md:flex-none">
                                <Button variant="outline" className="w-full">
                                    <PenSquare className="w-4 h-4 mr-2" />
                                    글쓰기
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden min-h-[200px] relative">
                {isLoading && (
                    <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}
                {/* Desktop View */}
                <Table className="hidden md:table">
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="w-[80px] text-center">번호</TableHead>
                            <TableHead>제목</TableHead>
                            <TableHead className="w-[120px]">작성자</TableHead>
                            <TableHead className="w-[120px] text-center">등록일</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {notices.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                                    등록된 공지사항이 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                        {notices.map((notice, i) => (
                            <TableRow
                                key={notice.id}
                                className="cursor-pointer hover:bg-gray-50"
                                onClick={() => router.push(`/notice/${notice.id}`)}
                                onMouseEnter={() => router.prefetch(`/notice/${notice.id}`)}
                            >
                                <TableCell className="text-center font-medium text-gray-500">
                                    {notice.important ? <Badge variant="destructive" className="text-[10px]">중요</Badge> : (notices.length - i)}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {notice.title}
                                </TableCell>
                                <TableCell>{notice.author.name}</TableCell>
                                <TableCell className="text-center text-gray-500 text-sm">
                                    {format(new Date(notice.createdAt), 'yyyy-MM-dd')}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Mobile View */}
                <div className="md:hidden divide-y">
                    {notices.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            등록된 공지사항이 없습니다.
                        </div>
                    )}
                    {notices.map((notice, i) => (
                        <div
                            key={notice.id}
                            className="p-4 cursor-pointer active:bg-gray-50"
                            onClick={() => router.push(`/notice/${notice.id}`)}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex flex-col gap-1 flex-1 min-w-0 mr-2">
                                    {notice.important && (
                                        <Badge variant="destructive" className="w-fit text-[10px] mb-1">중요</Badge>
                                    )}
                                    <h3 className="font-medium text-base truncate">{notice.title}</h3>
                                </div>
                                <span className={cn("text-xs text-gray-400 whitespace-nowrap ml-2", !notice.important && "mt-1")}>
                                    {format(new Date(notice.createdAt), 'MM.dd')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>{notice.author.name}</span>
                                <span className="text-xs text-gray-300">#{notices.length - i}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
