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

    // Fetch Items
    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch('/api/common/lost-found');
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpload = async () => {
        if (!title.trim() || !content.trim()) {
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

                if (!uploadRes.ok) throw new Error("Image upload failed");
                const uploadData = await uploadRes.json();
                imagePath = uploadData.url; // Note: API returns 'url', not 'path'
            }

            // 2. Create DB Entry
            const res = await fetch('/api/common/lost-found', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    location,
                    imagePath,
                })
            });

            if (!res.ok) throw new Error("DB Save Failed");

            toast.success("등록되었습니다!");
            setIsCreateOpen(false);
            // reset form
            setTitle(''); setContent(''); setLocation(''); setFile(null);
            // refresh
            fetchItems();
        } catch (e) {
            console.error(e);
            toast.error("등록에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (!confirm("정말 삭제하시겠습니까?")) return;

        try {
            const res = await fetch(`/api/common/lost-found/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("삭제되었습니다.");
                fetchItems();
                setSelectedId(null); // Close detail if open
            } else {
                toast.error("삭제 권한이 없거나 실패했습니다.");
            }
        } catch (e) {
            toast.error("오류가 발생했습니다.");
        }
    };

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selectedItem = items.find(i => i.id === selectedId);

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

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500">
                        등록된 분실물이 없습니다.
                    </div>
                )}
                {items.map(item => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setSelectedId(item.id)}>
                        <div className="aspect-square bg-gray-100 relative overflow-hidden rounded-t-lg">
                            {item.imagePath ? (
                                <Image src={item.imagePath} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
                                    <span className="text-xs">이미지 없음</span>
                                </div>
                            )}
                        </div>
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-base line-clamp-1">{item.title}</CardTitle>
                                <Badge variant={item.status === 'FOUND' ? 'default' : 'secondary'} className={item.status === 'LOST' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}>
                                    {item.status === 'LOST' ? '분실' : '습득'}
                                </Badge>
                            </div>
                            <CardDescription className="flex items-center gap-1 text-xs">
                                <MapPin className="w-3 h-3" /> {item.location || '장소 미상'}
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-gray-500">
                            <span>{item.author.name}</span>
                            <div className="flex items-center gap-2">
                                <span>{(new Date(item.createdAt)).toLocaleDateString()}</span>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
                <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{selectedItem?.title}</DialogTitle>
                    </DialogHeader>

                    {selectedItem && (
                        <div className="space-y-6">
                            {selectedItem.imagePath ? (
                                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black/5 border">
                                    <Image src={selectedItem.imagePath} alt={selectedItem.title} fill className="object-contain" />
                                </div>
                            ) : (
                                <div className="h-32 bg-gray-50 flex items-center justify-center rounded-lg text-gray-400">
                                    이미지가 없습니다.
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-500 block mb-1">상태</span>
                                    <Badge variant={selectedItem.status === 'FOUND' ? 'default' : 'secondary'} className={selectedItem.status === 'LOST' ? 'bg-yellow-100 text-yellow-800' : ''}>
                                        {selectedItem.status === 'LOST' ? '분실' : '습득'}
                                    </Badge>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-500 block mb-1">장소</span>
                                    <span className="font-medium">{selectedItem.location || '-'}</span>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-500 block mb-1">작성자</span>
                                    <span className="font-medium">{selectedItem.author.name}</span>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-500 block mb-1">등록일</span>
                                    <span className="font-medium">{(new Date(selectedItem.createdAt)).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="p-4 border rounded-lg bg-white whitespace-pre-wrap leading-relaxed">
                                {selectedItem.content}
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t">
                                {(session?.user?.id === selectedItem.authorId || session?.user?.role === 'ADMIN') && (
                                    <Button variant="destructive" onClick={(e) => handleDelete(selectedItem.id, e)}>
                                        삭제하기
                                    </Button>
                                )}
                                <Button variant="outline" onClick={() => setSelectedId(null)}>닫기</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
