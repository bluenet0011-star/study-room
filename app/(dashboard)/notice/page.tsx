'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Search, PenSquare } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Notice {
    id: string;
    title: string;
    author: { name: string };
    createdAt: string;
    important: boolean;
}

export default function NoticePage() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [search, setSearch] = useState('');
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async (query = '') => {
        const res = await fetch(`/api/notices?search=${query}`);
        const data = await res.json();
        setNotices(data.notices);
    };

    const handleSearch = () => {
        fetchNotices(search);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">공지사항</h1>
                <div className="flex gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="제목 검색"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-8"
                        />
                    </div>
                    <Button onClick={handleSearch}>검색</Button>
                    {/* TODO: Check role for Write button visibility */}
                    {(session?.user?.role === 'ADMIN' || session?.user?.role === 'TEACHER') && (
                        <Link href="/notice/write">
                            <Button variant="outline" className="ml-2">
                                <PenSquare className="w-4 h-4 mr-2" />
                                글쓰기
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <Table>
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
                                    {/* New badge logic could go here */}
                                </TableCell>
                                <TableCell>{notice.author.name}</TableCell>
                                <TableCell className="text-center text-gray-500 text-sm">
                                    {format(new Date(notice.createdAt), 'yyyy-MM-dd')}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
