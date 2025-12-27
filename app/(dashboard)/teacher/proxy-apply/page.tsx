'use client';

import { useState } from 'react';
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
        <div className="p-6 max-w-2xl mx-auto">
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
                                        다른 학생 선택
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex gap-2 relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="이름 또는 학번 검색..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                            className="pl-10"
                                            autoFocus
                                        />
                                        <Button onClick={handleSearch} disabled={isSearching} type="button">
                                            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "검색"}
                                        </Button>
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

                            <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50/50">
                                <Label htmlFor="on-campus" className="flex-1 font-medium">교내 활동 여부</Label>
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => setFormData({ ...formData, onCampus: false })}>
                                        <div className={cn("w-4 h-4 border rounded flex items-center justify-center", !formData.onCampus ? "bg-gray-900 border-gray-900" : "border-gray-400 bg-white")}>
                                            {!formData.onCampus && <div className="w-2 h-2 bg-white rounded-[1px]" />}
                                        </div>
                                        <span className={!formData.onCampus ? "font-bold text-gray-900" : "text-gray-500"}>교외</span>
                                    </div>
                                    <Switch
                                        id="on-campus"
                                        checked={formData.onCampus}
                                        onCheckedChange={(c: boolean) => setFormData({ ...formData, onCampus: c })}
                                        className="data-[state=checked]:bg-green-600"
                                    />
                                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => setFormData({ ...formData, onCampus: true })}>
                                        <div className={cn("w-4 h-4 border rounded flex items-center justify-center", formData.onCampus ? "bg-green-600 border-green-600" : "border-gray-400 bg-white")}>
                                            {formData.onCampus && <div className="w-2 h-2 bg-white rounded-[1px]" />}
                                        </div>
                                        <span className={formData.onCampus ? "font-bold text-green-600" : "text-gray-500"}>교내</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>날짜</Label>
                                    <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label>시작</Label>
                                        <Input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
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
