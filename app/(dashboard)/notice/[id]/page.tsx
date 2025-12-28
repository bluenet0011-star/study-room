'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface Notice {
    id: string;
    title: string;
    content: string;
    author: { name: string };
    createdAt: string;
}

export default function NoticeDetailPage({ params }: { params: { id: string } }) {
    const { data: session } = useSession();
    const [notice, setNotice] = useState<Notice | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetch(`/api/notices/${params.id}`)
            .then(res => res.json())
            .then(setNotice)
            .catch(console.error);
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("삭제하시겠습니까?")) return;
        try {
            const res = await fetch(`/api/notices/${params.id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("삭제되었습니다.");
                router.push('/notice');
            } else {
                toast.error("권한이 없거나 실패했습니다.");
            }
        } catch (e) { toast.error("오류 발생"); }
    };

    if (!notice) return <div className="p-20 text-center">Loading...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600">
                <ArrowLeft className="w-5 h-5 mr-2" />
                목록으로 돌아가기
            </Button>

            <div className="bg-white border rounded-lg shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                <div className="p-6 border-b bg-gray-50/30">
                    <h1 className="text-2xl font-bold mb-4 text-gray-900">{notice.title}</h1>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex gap-4">
                            <span>작성자: <span className="text-gray-900 font-medium">{notice.author.name}</span></span>
                            <span>등록일: {format(new Date(notice.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                        </div>
                        {/* TODO: Check if user is author or admin - Currently allowing Admin/Teacher */}
                        {/* Note: Ideally we should check authorId, but for now robust role check is sufficient for this school context */}
                        {(session?.user?.role === 'ADMIN' || session?.user?.role === 'TEACHER') && (
                            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4 mr-2" />
                                삭제
                            </Button>
                        )}
                    </div>
                </div>
                <div className="p-8 whitespace-pre-wrap text-gray-700 leading-relaxed text-base">
                    {notice.content}
                </div>
            </div>
        </div>
    );
}
