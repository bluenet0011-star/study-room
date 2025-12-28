'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, MapPin, Search, UploadCloud } from 'lucide-react';
import Image from 'next/image';

interface LostItem {
    id: string;
    title: string;
    content: string;
    location: string;
    imagePath: string;
    status: 'LOST' | 'FOUND';
    authorId: string;
    createdAt: string;
    author: { name: string };
}

export default function LostFoundPage() {
    const { data: session } = useSession();
    const [items, setItems] = useState<LostItem[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form Stats
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [location, setLocation] = useState('');
    const [file, setFile] = useState<File | null>(null);

    // Fetch Items (Mock for now, needs API)
    useEffect(() => {
        // Need to implement GET API
        // fetchItems(); 
    }, []);

    const handleUpload = async () => {
        if (!title || !content) {
            toast.error("제목과 내용을 입력해주세요.");
            return;
        }

        setLoading(true);
        try {
            let imagePath = '';

            // 1. Upload File (if exists)
            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                const uploadData = await uploadRes.json();

                if (!uploadRes.ok) throw new Error(uploadData.Message);
                imagePath = uploadData.path;
            }

            // 2. Create DB Entry
            const res = await fetch('/api/common/lost-found', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    location,
                    imagePath: imagePath, // Can be empty string
                    authorName: session?.user?.name
                })
            });

            if (!res.ok) throw new Error("DB Save Failed");

            toast.success("등록되었습니다!");
            setIsCreateOpen(false);
            // reset form
            setTitle(''); setContent(''); setLocation(''); setFile(null);
            // refresh
            // fetchItems();
        } catch (e) {
            console.error(e);
            toast.error("등록에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">분실물 센터</h1>
                    <p className="text-muted-foreground">학교에서 잃어버리거나 습득한 물건을 공유하세요.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2"><Plus className="w-4 h-4" /> 물건 등록</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>분실물/습득물 등록</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>제목</Label>
                                <Input placeholder="예: 3층 복도에서 에어팟 습득" value={title} onChange={e => setTitle(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>발견/분실 장소</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input className="pl-9" placeholder="예: 자습실 3열 5번" value={location} onChange={e => setLocation(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>내용</Label>
                                <Textarea placeholder="물건의 특징이나 보관 장소를 적어주세요." value={content} onChange={e => setContent(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>사진 업로드</Label>
                                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-sm text-gray-500 hover:bg-gray-50 cursor-pointer relative">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={e => setFile(e.target.files?.[0] || null)}
                                    />
                                    <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
                                    {file ? <span className="text-blue-600 font-medium">{file.name}</span> : <span>클릭하여 사진 선택</span>}
                                </div>
                            </div>
                            <Button className="w-full" onClick={handleUpload} disabled={loading}>
                                {loading ? "등록 중..." : "등록하기"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Empty State / Grid - Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Items would map here */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <div className="aspect-square bg-gray-100 relative">
                        {/* Image Placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">이미지 없음</div>
                    </div>
                    <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-base line-clamp-1">에어팟 프로 오른쪽</CardTitle>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">보관중</Badge>
                        </div>
                        <CardDescription className="flex items-center gap-1 text-xs">
                            <MapPin className="w-3 h-3" /> 3층 홈베이스
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 text-xs text-gray-500">
                        2024.12.27 등록
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
