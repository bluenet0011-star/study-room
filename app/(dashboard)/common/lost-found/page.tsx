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
import { Plus, MapPin, Search, User, Briefcase, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface LostItem {
    id: string;
    title: string;
    content: string;
    location: string;
    keeper?: string;
    imagePath?: string;
    status: 'LOST' | 'FOUND';
    authorId: string;
    createdAt: string;
    author: { name: string };
}

export default function LostFoundPage() {
    const { data: session } = useSession();
    const [items, setItems] = useState<LostItem[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form Stats
    const [type, setType] = useState<'LOST' | 'FOUND'>('LOST');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [location, setLocation] = useState('');
    const [keeper, setKeeper] = useState('');

    // Fetch Items
    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async (query = '') => {
        setIsFetching(true);
        try {
            const res = await fetch(`/api/common/lost-found?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsFetching(false);
        }
    };

    const handleSearch = () => {
        fetchItems(searchTerm);
    };

    const handleCreate = async () => {
        // Validation
        if (!title.trim() || !content.trim()) {
            toast.error("제목과 내용을 입력해주세요.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/common/lost-found', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    location,
                    keeper,
                    status: type
                })
            });

            if (!res.ok) throw new Error("DB Save Failed");

            toast.success("등록되었습니다!");
            setIsCreateOpen(false);
            // reset form
            setTitle(''); setContent(''); setLocation(''); setKeeper(''); setType('LOST');
            // refresh
            fetchItems(searchTerm);
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
                fetchItems(searchTerm);
                setSelectedId(null);
            } else {
                toast.error("삭제 권한이 없거나 실패했습니다.");
            }
        } catch (e) {
            toast.error("오류가 발생했습니다.");
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: 'LOST' | 'FOUND') => {
        try {
            const res = await fetch(`/api/common/lost-found/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                toast.success("상태가 변경되었습니다.");
                fetchItems(searchTerm);
                // Update selected item locally to reflect change immediately in dialog
                if (selectedItem && selectedItem.id === id) {
                    setItems(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
                }
            } else {
                toast.error("변경 권한이 없거나 실패했습니다.");
            }
        } catch (e) {
            toast.error("오류가 발생했습니다.");
        }
    };

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selectedItem = items.find(i => i.id === selectedId);

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">분실물 센터</h1>
                    <p className="text-muted-foreground">학교에서 잃어버리거나 습득한 물건을 공유하세요.</p>
                </div>

                <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2 text-sm mt-2 md:mt-0">
                    <span className="font-bold shrink-0">주의:</span>
                    <span>분실물 센터에 사적인 글이나 장난 글을 올리지 마세요.</span>
                </div>

                <div className="flex w-full md:w-auto gap-2">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="물건, 장소, 보관자 검색"
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Button variant="secondary" onClick={handleSearch}>검색</Button>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2"><Plus className="w-4 h-4" /> 글쓰기</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>분실물 센터 글쓰기</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <RadioGroup value={type} onValueChange={(v: any) => setType(v)} className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <RadioGroupItem value="LOST" id="r-lost" className="peer sr-only" />
                                        <Label
                                            htmlFor="r-lost"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-yellow-50 [&:has([data-state=checked])]:border-primary cursor-pointer"
                                        >
                                            <span className="text-xl mb-2">😭</span>
                                            <span className="font-semibold text-yellow-700">분실 (찾습니다)</span>
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="FOUND" id="r-found" className="peer sr-only" />
                                        <Label
                                            htmlFor="r-found"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-green-50 [&:has([data-state=checked])]:border-primary cursor-pointer"
                                        >
                                            <span className="text-xl mb-2">🍀</span>
                                            <span className="font-semibold text-green-700">습득 (보관중)</span>
                                        </Label>
                                    </div>
                                </RadioGroup>

                                <div className="space-y-2">
                                    <Label>제목</Label>
                                    <Input placeholder={type === 'LOST' ? "예: 에어팟 프로 본체 잃어버리신 분" : "예: 3층 급수대 위 검은 지갑"} value={title} onChange={e => setTitle(e.target.value)} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{type === 'LOST' ? '분실 추정 장소' : '습득 장소'}</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                            <Input className="pl-9" placeholder="예: 3층 복도" value={location} onChange={e => setLocation(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{type === 'LOST' ? '연락받을 곳' : '보관 장소/사람'}</Label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                            <Input className="pl-9" placeholder={type === 'LOST' ? "예: 2-5 윤준서" : "예: 2학년 교무실"} value={keeper} onChange={e => setKeeper(e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>상세 내용</Label>
                                    <Textarea
                                        placeholder="물건의 특징(색상, 제조사 등)이나 구체적인 상황을 적어주세요."
                                        className="min-h-[100px]"
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                    />
                                </div>

                                <Button className="w-full" onClick={handleCreate} disabled={loading}>
                                    {loading ? "등록 중..." : "등록하기"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[200px]">
                {isFetching && (
                    <div className="col-span-full flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}
                {!isFetching && items.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50/50 rounded-xl border-2 border-dashed">
                        <Search className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium">등록된 글이 없습니다.</p>
                        <p className="text-sm">첫 번째 글을 작성해보세요!</p>
                    </div>
                )}
                {!isFetching && items.map(item => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer group flex flex-col" onClick={() => setSelectedId(item.id)}>
                        <CardHeader className="p-4 pb-3">
                            <div className="flex justify-between items-start gap-2 mb-2">
                                <Badge variant="outline" className={item.status === 'LOST' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200'}>
                                    {item.status === 'LOST' ? '😭 분실' : '🍀 습득'}
                                </Badge>
                                {(new Date(item.createdAt).getTime() > Date.now() - 1000 * 60 * 60 * 24 * 3) && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">N</span>}
                            </div>
                            <CardTitle className="text-base font-semibold line-clamp-1">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 py-2 flex-grow">
                            <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-wrap">{item.content}</p>
                            <div className="mt-4 space-y-1">
                                {item.location && (
                                    <div className="flex items-center text-xs text-gray-500">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        <span className="truncate">{item.location}</span>
                                    </div>
                                )}
                                {item.keeper && (
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Briefcase className="w-3 h-3 mr-1" />
                                        <span className="truncate">{item.status === 'LOST' ? '연락:' : '보관:'} {item.keeper}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-3 flex justify-between items-center text-xs text-gray-400 border-t bg-gray-50/30">
                            <div className="flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                <span>{item.author.name}</span>
                            </div>
                            <span>{(new Date(item.createdAt)).toLocaleDateString()}</span>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={selectedItem?.status === 'LOST' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200'}>
                                {selectedItem?.status === 'LOST' ? '😭 분실' : '🍀 습득'}
                            </Badge>
                            <span className="text-xs text-gray-400">{(new Date(selectedItem?.createdAt || '')).toLocaleString()}</span>
                        </div>
                        <DialogTitle className="text-xl">{selectedItem?.title}</DialogTitle>
                    </DialogHeader>

                    {selectedItem && (
                        <div className="space-y-6 py-2">
                            <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg text-sm border">
                                <div className="grid grid-cols-[80px_1fr] gap-2">
                                    <span className="text-gray-500 font-medium">작성자</span>
                                    <span>{selectedItem.author.name}</span>
                                </div>
                                <div className="grid grid-cols-[80px_1fr] gap-2">
                                    <span className="text-gray-500 font-medium">{selectedItem.status === 'LOST' ? '분실 장소' : '습득 장소'}</span>
                                    <span>{selectedItem.location || '-'}</span>
                                </div>
                                <div className="grid grid-cols-[80px_1fr] gap-2">
                                    <span className="text-gray-500 font-medium">{selectedItem.status === 'LOST' ? '연락처' : '보관 장소'}</span>
                                    <span className="font-semibold text-primary">{selectedItem.keeper || '-'}</span>
                                </div>
                            </div>

                            <div className="whitespace-pre-wrap leading-relaxed min-h-[100px]">
                                {selectedItem.content}
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                {(session?.user?.id === selectedItem.authorId || session?.user?.role === 'ADMIN') && (
                                    <>
                                        {selectedItem.status === 'LOST' ? (
                                            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateStatus(selectedItem.id, 'FOUND')}>
                                                찾음 완료
                                            </Button>
                                        ) : (
                                            <Button variant="outline" onClick={() => handleUpdateStatus(selectedItem.id, 'LOST')}>
                                                다시 분실 처리
                                            </Button>
                                        )}
                                        <Button variant="destructive" onClick={(e) => handleDelete(selectedItem.id, e)}>
                                            삭제하기
                                        </Button>
                                    </>
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
