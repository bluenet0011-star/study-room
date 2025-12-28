'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NoticeWritePage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [important, setImportant] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [attachments, setAttachments] = useState<string[]>([]);
    const router = useRouter();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);

            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);

                try {
                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setAttachments(prev => [...prev, data.path]);
                    } else {
                        toast.error(`${file.name} 업로드 실패`);
                    }
                } catch (err) {
                    console.error(err);
                    toast.error("파일 업로드 중 오류 발생");
                }
            }
        }
    };

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
                body: JSON.stringify({ title, content, important, attachments })
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

                <div className="flex flex-col gap-4 border p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-4">
                        <Label className="w-20">첨부파일</Label>
                        <div className="flex-1 flex items-center gap-2">
                            <Input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="w-full max-w-sm"
                            />
                            <span className="text-xs text-gray-400">최대 10MB</span>
                        </div>
                    </div>
                    {attachments.length > 0 && (
                        <div className="pl-24 flex flex-col gap-2">
                            {attachments.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border text-sm">
                                    <span className="truncate max-w-[300px]">{file.split('/').pop()}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-red-500"
                                        onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                                    >
                                        ✕
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
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
