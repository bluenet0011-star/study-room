'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function EmptyPeriodPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        start: '09:00',
        end: '10:00',
        location: '',
        memo: ''
    });

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        const res = await fetch('/api/student/empty-period');
        if (res.ok) setHistory(await res.json());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/student/empty-period', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success("공강 등록이 완료되었습니다.");
                setFormData({ ...formData, location: '', memo: '' });
                fetchHistory();
            } else {
                toast.error("등록에 실패했습니다.");
            }
        } catch (e) {
            toast.error("오류가 발생했습니다.");
        }
        setLoading(false);
    };

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
            <div className="flex-1">
                <h1 className="text-2xl font-bold mb-4">공강 관리</h1>
                <p className="text-gray-500 mb-6">공강 시간 활동 계획을 등록하세요.</p>

                <Card>
                    <CardHeader>
                        <CardTitle>공강 등록</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>날짜</Label>
                                <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>시작 시간</Label>
                                    <Input type="time" value={formData.start} onChange={e => setFormData({ ...formData, start: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>종료 시간</Label>
                                    <Input type="time" value={formData.end} onChange={e => setFormData({ ...formData, end: e.target.value })} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>장소명</Label>
                                <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="예: 도서관, 홈베이스" required />
                            </div>
                            <div className="space-y-2">
                                <Label>메모</Label>
                                <Textarea value={formData.memo} onChange={e => setFormData({ ...formData, memo: e.target.value })} placeholder="학습 내용 등..." />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                등록하기
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <div className="w-full md:w-96">
                <h2 className="text-xl font-bold mb-4">등록 현황</h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {history.map(item => (
                        <Card key={item.id} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-gray-900">{format(new Date(item.date), 'MM.dd')}</span>
                                <span className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">
                                    {format(new Date(item.start), 'HH:mm')} ~ {format(new Date(item.end), 'HH:mm')}
                                </span>
                            </div>
                            <p className="font-medium text-blue-600">{item.location}</p>
                            {item.memo && <p className="text-sm text-gray-500 mt-1">{item.memo}</p>}
                        </Card>
                    ))}
                    {history.length === 0 && <p className="text-gray-500 text-center py-4">등록된 내역이 없습니다.</p>}
                </div>
            </div>
        </div>
    );
}
