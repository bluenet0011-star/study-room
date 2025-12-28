'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Search, UserPlus, Calendar } from 'lucide-react';
import { useSocket } from '@/components/providers/SocketProvider';
import { useSession } from 'next-auth/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Student {
    id: string;
    name: string;
    grade: number;
    class: number;
    number: number;
}

export default function ProxyApplyPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const socket = useSocket();
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Student[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const [formData, setFormData] = useState({
        type: 'MOVEMENT',
        date: new Date().toISOString().split('T')[0],
        startTime: '18:00',
        endTime: '21:00',
        reason: '',
        location: '',
        onCampus: true
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`/api/admin/students/search?query=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            setSearchResults(data);
        } catch (e) {
            console.error("Search failed", e);
        }
        setIsSearching(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // ... (rest of submit logic matches original)
        if (!selectedStudent) {
            toast.error('학생을 선택하세요.');
            return;
        }
        setLoading(true);
        try {
            const startStr = `${formData.date}T${formData.startTime}`;
            const endStr = `${formData.date}T${formData.endTime}`;

            const res = await fetch('/api/teacher/proxy-apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: selectedStudent.id,
                    type: formData.type,
                    start: new Date(startStr).toISOString(),
                    end: new Date(endStr).toISOString(),
                    reason: formData.reason,
                    location: formData.location
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (socket) {
                    socket.emit('PERMISSION_UPDATE', {
                        id: data.id,
                        status: 'APPROVED',
                        studentId: data.studentId,
                        teacherId: session?.user?.id,
                        studentName: selectedStudent.name
                    });
                }
                toast.success(`${selectedStudent.name} 학생의 퍼미션이 등록되었습니다.`);
                router.push('/teacher/permissions');
            } else {
                toast.error('신청에 실패했습니다.');
            }
        } catch (e) {
            console.error("Submission error", e);
            toast.error("오류가 발생했습니다.");
        }
        setLoading(false);
    };

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">대리 퍼미션 신청</h1>
            <p className="text-gray-500 mb-6">학생을 대신하여 퍼미션을 등록하고 즉시 승인합니다.</p>

            <Card className="border-t-4 border-t-green-500 shadow-md">
                <CardHeader className="bg-gray-50/50 pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-green-600" />
                        학생 선택 및 신청서 작성
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        {/* Student Search Section */}
                        <div className="space-y-2">
                            <Label>학생 검색</Label>
                            {selectedStudent ? (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center animate-in fade-in zoom-in duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold">
                                            {selectedStudent.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-green-900 text-lg">{selectedStudent.name}</p>
                                            <p className="text-sm text-green-700">{selectedStudent.grade}학년 {selectedStudent.class}반 {selectedStudent.number}번</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(null)} className="hover:bg-green-100 hover:text-green-800">
                                        창 닫기
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="이름 또는 학번을 입력하면 자동 검색됩니다..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                            autoFocus
                                        />
                                        {isSearching && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />}
                                    </div>
                                    {searchResults.length > 0 && (
                                        <ScrollArea className="h-48 border rounded-md bg-white shadow-sm">
                                            <div className="p-2 space-y-1">
                                                {searchResults.map(s => (
                                                    <div
                                                        key={s.id}
                                                        className="flex justify-between items-center p-3 hover:bg-gray-50 cursor-pointer rounded-md transition-colors"
                                                        onClick={() => { setSelectedStudent(s); setSearchResults([]); setSearchQuery(''); }}
                                                    >
                                                        <span className="font-medium">{s.name}</span>
                                                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{s.grade}-{s.class}-{s.number}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Form Section */}
                        <form onSubmit={handleSubmit} className={cn("space-y-6 transition-opacity duration-300", !selectedStudent && "opacity-50 pointer-events-none")}>

                            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                                <Label htmlFor="on-campus" className="font-medium">교내 활동 여부</Label>
                                <div className="flex items-center gap-2">
                                    <span className={cn("text-sm", !formData.onCampus ? "font-bold text-gray-900" : "text-gray-500")}>교외</span>
                                    <Switch
                                        id="on-campus"
                                        checked={formData.onCampus}
                                        onCheckedChange={(c: boolean) => setFormData({ ...formData, onCampus: c })}
                                        className="data-[state=checked]:bg-green-600"
                                    />
                                    <span className={cn("text-sm", formData.onCampus ? "font-bold text-green-600" : "text-gray-500")}>교내</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>유형</Label>
                                    <Select onValueChange={val => setFormData({ ...formData, type: val })} defaultValue={formData.type}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MOVEMENT">이동</SelectItem>
                                            <SelectItem value="OUTING">외출</SelectItem>
                                            <SelectItem value="EARLY_LEAVE">조퇴</SelectItem>
                                            <SelectItem value="OTHER">기타</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>장소명</Label>
                                    <Input
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="예: 보건실, 상담실"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>날짜</Label>
                                    <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="space-y-2 flex-1">
                                        <Label>시작</Label>
                                        <Input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <Label>종료</Label>
                                        <Input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} required />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>사유</Label>
                                <Textarea value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="대리 신청 사유를 입력하세요..." required />
                            </div>

                            <Button type="submit" className="w-full h-12 text-lg bg-green-600 hover:bg-green-700" disabled={loading || !selectedStudent}>
                                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                대리 신청 및 승인
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
