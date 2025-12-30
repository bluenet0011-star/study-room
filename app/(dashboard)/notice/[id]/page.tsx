'use client';
import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface Notice {
    id: string;
    title: string;
    content: string;
    author: { name: string };
    link?: string;
    createdAt: string;
}

export default function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { data: session } = useSession();
    const [notice, setNotice] = useState<Notice | null>(null);
    const router = useRouter();
    const { id } = use(params);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/notices/${id}`)
            .then(res => res.json())
            .then(setNotice)
            .catch(console.error);
    }, [id]);

    const handleDelete = async () => {
        if (!confirm("삭제하시겠습니까?")) return;
        try {
            const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("삭제되었습니다.");
                router.push('/notice');
            } else {
                toast.error("권한이 없거나 실패했습니다.");
            }
        } catch (e) { toast.error("오류 발생"); }
    };

    // Helper to auto-linkify text
    const renderContent = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);

        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                return (
                    <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                        {part}
                    </a>
                );
            }
            return part;
        });
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
                        {(session?.user?.role === 'ADMIN' || session?.user?.role === 'TEACHER') && (
                            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4 mr-2" />
                                삭제
                            </Button>
                        )}
                    </div>
                </div>

                <div className="p-8">
                    {notice.link && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                            <div className="flex flex-col gap-1 overflow-hidden">
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Related Link</span>
                                <a href={notice.link} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-medium hover:underline truncate block">
                                    {notice.link}
                                </a>
                            </div>
                            <a href={notice.link} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="bg-white hover:bg-blue-50 text-blue-700 border-blue-200 shrink-0 ml-4">
                                    바로가기 <ExternalLink className="w-3 h-3 ml-2" />
                                </Button>
                            </a>
                        </div>
                    )}

                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base min-h-[300px]">
                        {renderContent(notice.content)}
                    </div>
                </div>
            </div>
        </div>
    );
}
