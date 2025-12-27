'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Users, QrCode } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function TeacherEventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const res = await fetch('/api/teacher/events');
        if (res.ok) setEvents(await res.json());
    };

    const handleCreate = async () => {
        if (!newTitle) return;

        const res = await fetch('/api/teacher/events', {
            method: 'POST',
            body: JSON.stringify({ title: newTitle })
        });

        if (res.ok) {
            toast.success("행사가 생성되었습니다.");
            setNewTitle('');
            setIsCreateOpen(false);
            fetchEvents();
        } else {
            toast.error("생성 실패");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">QR 출석/행사 관리</h1>
                    <p className="text-gray-500">행사를 생성하고 학생들의 QR코드를 스캔하여 출석을 체크합니다.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2"><Plus className="w-4 h-4" /> 새 행사 만들기</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>새 행사 생성</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>행사명</Label>
                                <Input placeholder="예: 3월 모의고사 소집" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                            </div>
                            <Button className="w-full" onClick={handleCreate}>생성하기</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map(event => (
                    <Card key={event.id} className="hover:border-primary transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-bold">{event.title}</CardTitle>
                            <QrCode className="w-5 h-5 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-gray-500">{event.date}</p>
                                    <p className="text-2xl font-bold mt-1">{event.count}명 <span className="text-sm font-normal text-gray-500">참여</span></p>
                                </div>
                                <Link href={`/teacher/events/${event.id}`}>
                                    <Button variant="secondary" size="sm">출석 체크하기</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
