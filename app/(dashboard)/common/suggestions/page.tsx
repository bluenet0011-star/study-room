'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Search, User, MessageSquare, Loader2 } from 'lucide-react';

interface Suggestion {
    id: string;
    title: string;
    content: string;
    authorId: string;
    createdAt: string;
    author: {
        id: string;
        role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    };
}

export default function SuggestionsPage() {
    const { data: session } = useSession();
    const [items, setItems] = useState<Suggestion[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form Stats
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    // Fetch Items
    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setIsFetching(true);
        try {
            const res = await fetch(`/api/community/suggestions`); // Assuming generic fetch, search client-side or modify API
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

    const handleCreate = async () => {
        if (!title.trim() || !content.trim()) {
            toast.error("제목과 내용을 입력해주세요.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/community/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content
                })
            });

            if (!res.ok) throw new Error("Save Failed");

            toast.success("등록되었습니다!");
            setIsCreateOpen(false);
            setTitle(''); setContent('');
            fetchItems();
        } catch (e) {
            console.error(e);
            toast.error("등록에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("정말 삭제하시겠습니까?")) return;

        try {
            const res = await fetch(`/api/community/suggestions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("삭제되었습니다.");
                fetchItems();
                setSelectedId(null);
            } else {
                toast.error("삭제 권한이 없거나 실패했습니다.");
            }
        } catch (e) {
            toast.error("오류가 발생했습니다.");
        }
    };

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selectedItem = items.find(i => i.id === selectedId);

    const getAuthorGenericName = (role: string) => {
        if (role === 'TEACHER') return '선생님';
        if (role === 'ADMIN') return '관리자';
        return '학생';
    };

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [isCreditsOpen, setIsCreditsOpen] = useState(false);

    // ... (inside component)

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-6 h-6" />
                        건의함
                    </h1>
                    <p className="text-muted-foreground">학교 생활에 대한 건의사항을 자유롭게 남겨주세요. (작성자는 익명으로 처리됩니다)</p>
                </div>

                <div className="flex w-full md:w-auto gap-2">
                    {/* Credits Button */}
                    <Button variant="outline" size="icon" onClick={() => setIsCreditsOpen(true)} title="Credits">
                        <span className="text-xl">©</span>
                    </Button>

                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="검색어 입력..."
                            className="pl-9 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                건의하기
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>건의사항 작성</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>제목</Label>
                                    <Input
                                        placeholder="제목을 입력하세요"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>내용</Label>
                                    <Textarea
                                        placeholder="학교 발전을 위한 소중한 의견을 적어주세요. 상호 존중하는 언어를 사용해주시기 바랍니다."
                                        className="min-h-[150px]"
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>취소</Button>
                                <Button onClick={handleCreate} disabled={loading}>
                                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    등록하기
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Credits Dialog */}
            <Dialog open={isCreditsOpen} onOpenChange={setIsCreditsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Credits</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-center space-y-2">
                        <p className="text-lg font-bold">Study Room Management System</p>
                        <p className="text-gray-500">Developed by DGHS IT Club</p>
                        <div className="pt-4 text-sm text-gray-400">
                            Version 1.0.0
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ... rest of component ... */}

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[200px]">
                {isFetching && (
                    <div className="col-span-full flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}
                {!isFetching && filteredItems.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50/50 rounded-xl border-2 border-dashed">
                        <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium">등록된 건의사항이 없습니다.</p>
                        <p className="text-sm">첫 번째 건의사항을 작성해보세요!</p>
                    </div>
                )}
                {!isFetching && filteredItems.map(item => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer group flex flex-col" onClick={() => setSelectedId(item.id)}>
                        <CardHeader className="p-4 pb-3">
                            <div className="flex justify-between items-start gap-2 mb-2">
                                <Badge variant="outline" className={item.author.role === 'TEACHER' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>
                                    {getAuthorGenericName(item.author.role)}
                                </Badge>
                                {(new Date(item.createdAt).getTime() > Date.now() - 1000 * 60 * 60 * 24 * 3) && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">N</span>}
                            </div>
                            <CardTitle className="text-base font-semibold line-clamp-1">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 py-2 flex-grow">
                            <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-wrap">{item.content}</p>
                        </CardContent>
                        <CardFooter className="p-4 pt-3 flex justify-between items-center text-xs text-gray-400 border-t bg-gray-50/30">
                            <div className="flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                <span>{getAuthorGenericName(item.author.role)}</span>
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
                            <Badge variant="outline" className={selectedItem?.author.role === 'TEACHER' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>
                                {selectedItem && getAuthorGenericName(selectedItem.author.role)}
                            </Badge>
                            <span className="text-xs text-gray-400">{(new Date(selectedItem?.createdAt || '')).toLocaleString()}</span>
                        </div>
                        <DialogTitle className="text-xl">{selectedItem?.title}</DialogTitle>
                    </DialogHeader>

                    {selectedItem && (
                        <div className="space-y-6 py-2">
                            <div className="whitespace-pre-wrap leading-relaxed min-h-[100px] bg-gray-50 p-4 rounded-md text-sm border">
                                {selectedItem.content}
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
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
