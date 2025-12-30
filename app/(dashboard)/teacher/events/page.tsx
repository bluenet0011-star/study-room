'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, QrCode, Upload, Download, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface StudentTarget {
    name: string;
    studentId: string;
}

export default function TeacherEventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    // Target List State
    const [targets, setTargets] = useState<StudentTarget[]>([]);
    const [manualName, setManualName] = useState('');
    const [manualId, setManualId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const res = await fetch('/api/teacher/events');
        if (res.ok) setEvents(await res.json());
    };

    const handleCreate = async () => {
        if (!newTitle) {
            toast.error("행사명을 입력해주세요.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/teacher/events', {
                method: 'POST',
                body: JSON.stringify({
                    title: newTitle,
                    targets: targets
                })
            });

            if (res.ok) {
                toast.success("행사가 생성되었습니다.");
                setNewTitle('');
                setTargets([]);
                setIsCreateOpen(false);
                fetchEvents();
            } else {
                toast.error("생성 실패");
            }
        } catch (e) {
            toast.error("오류가 발생했습니다.");
        }
        setSubmitting(false);
    };

    const addManualTarget = () => {
        if (!manualName || !manualId) {
            toast.error("이름과 학번을 모두 입력해주세요.");
            return;
        }
        setTargets([...targets, { name: manualName, studentId: manualId }]);
        setManualName('');
        setManualId('');
    };

    const removeTarget = (idx: number) => {
        setTargets(targets.filter((_, i) => i !== idx));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws) as any[];

            // Map data assuming 'name' and 'studentId' (or common Korean headers)
            // Flexible matching for headers: name/이름, studentId/id/학번
            const parsed: StudentTarget[] = [];
            data.forEach(row => {
                const name = row['name'] || row['이름'] || row['Name'];
                const id = row['studentId'] || row['id'] || row['학번'] || row['ID'];

                if (name && id) {
                    parsed.push({ name: String(name), studentId: String(id) });
                }
            });

            if (parsed.length > 0) {
                setTargets([...targets, ...parsed]);
                toast.success(`${parsed.length}명 추가되었습니다.`);
            } else {
                toast.error("올바른 데이터를 찾을 수 없습니다. 템플릿을 확인해주세요.");
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = ''; // Reset input
    };

    const downloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { 이름: "홍길동", 학번: "10101" },
            { 이름: "김철수", 학번: "10102" }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, "student_template.xlsx");
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">QR 출석/행사 관리</h1>
                    <p className="text-gray-500">행사를 생성하고 학생들의 QR코드를 스캔하여 출석을 체크합니다.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2"><Plus className="w-4 h-4" /> 새 행사 만들기</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-full">
                        <DialogHeader>
                            <DialogTitle>새 행사 생성</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label>행사명</Label>
                                <Input placeholder="예: 3월 모의고사 소집" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label>참여 학생 명단 (선택)</Label>
                                <div className="border rounded-md p-4 bg-gray-50">
                                    <Tabs defaultValue="manual" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="manual">직접 입력</TabsTrigger>
                                            <TabsTrigger value="excel">엑셀 업로드</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="manual" className="space-y-4 pt-4">
                                            <div className="flex gap-2">
                                                <Input placeholder="이름" value={manualName} onChange={e => setManualName(e.target.value)} className="flex-1" />
                                                <Input placeholder="학번/ID" value={manualId} onChange={e => setManualId(e.target.value)} className="flex-1" />
                                                <Button onClick={addManualTarget} variant="secondary">추가</Button>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="excel" className="space-y-4 pt-4">
                                            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-white">
                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-500 mb-4">엑셀 파일(.xlsx)을 업로드하세요</p>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => document.getElementById('excel-upload')?.click()}>
                                                        파일 선택
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={downloadTemplate} className="text-blue-600">
                                                        <Download className="w-4 h-4 mr-1" /> 템플릿 다운로드
                                                    </Button>
                                                </div>
                                                <input
                                                    id="excel-upload"
                                                    type="file"
                                                    accept=".xlsx, .xls"
                                                    className="hidden"
                                                    onChange={handleFileUpload}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                * 엑셀 파일의 첫 번째 줄(헤더)에 '이름', '학번' 컬럼이 포함되어야 합니다.
                                            </p>
                                        </TabsContent>
                                    </Tabs>

                                    {/* Preview List */}
                                    <div className="mt-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">추가된 학생: {targets.length}명</span>
                                            {targets.length > 0 && (
                                                <Button variant="ghost" size="sm" onClick={() => setTargets([])} className="text-red-500 text-xs h-6">전체 삭제</Button>
                                            )}
                                        </div>
                                        <div className="max-h-[200px] overflow-y-auto bg-white border rounded">
                                            {targets.length === 0 ? (
                                                <div className="p-4 text-center text-sm text-gray-400">추가된 학생이 없습니다.</div>
                                            ) : (
                                                <div className="divide-y">
                                                    {targets.map((t, idx) => (
                                                        <div key={idx} className="flex justify-between items-center p-2 text-sm hover:bg-gray-50">
                                                            <span>{t.name} <span className="text-gray-400">({t.studentId})</span></span>
                                                            <button onClick={() => removeTarget(idx)} className="text-gray-400 hover:text-red-500">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleCreate} disabled={submitting}>
                                <Plus className="w-4 h-4 mr-2" />
                                {submitting ? '생성 중...' : `행사 생성하기 (${targets.length}명 명단 포함)`}
                            </Button>
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
