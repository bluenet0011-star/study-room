'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LinkIcon } from 'lucide-react';

export default function NoticeWritePage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [link, setLink] = useState('');
    const [important, setImportant] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            toast.error("제목과 내용을 입력해주세요.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/notices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, important, link })
            });

            if (res.ok) {
                toast.success("공지사항이 등록되었습니다.");
                router.push('/notice');
            } else {
                const errorText = await res.text();
                console.error("Notice registration failed:", res.status, errorText);
                toast.error(`등록에 실패했습니다: ${res.status}`);
            }
        } catch (e) {
            console.error("Fetch error:", e);
            toast.error("오류가 발생했습니다.");
        }
        setSubmitting(false);
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">공지사항 등록</h1>

            <div className="space-y-6 bg-white p-6 border rounded-lg shadow-sm">
                <div className="space-y-2">
                    <Label>제목</Label>
                    <Input
                        placeholder="제목을 입력하세요"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>관련 링크 (선택)</Label>
                    <div className="relative">
                        <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="https://example.com"
                            className="pl-9"
                            value={link}
                            onChange={e => setLink(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="important"
                        checked={important}
                        onCheckedChange={(c: boolean | string) => setImportant(!!c)}
                    />
                    <Label htmlFor="important" className="cursor-pointer font-medium text-red-600">중요 공지사항으로 등록</Label>
                </div>

                <div className="space-y-2">
                    <Label>내용</Label>
                    <div className="text-xs text-muted-foreground mb-1">
                        * 내용에 포함된 인터넷 주소(URL)는 자동으로 클릭 가능한 링크로 변환됩니다.
                    </div>
                    <Textarea
                        placeholder="내용을 입력하세요"
                        className="min-h-[300px]"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => router.back()} disabled={submitting}>취소</Button>
                    <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">등록</Button>
                </div>
            </div>
        </div>
    );
}
