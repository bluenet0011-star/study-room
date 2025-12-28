'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Search, Lock, Edit } from 'lucide-react';

interface Student {
    id: string;
    loginId: string;
    name: string;
    grade: number;
    class: number;
    number: number;
}

export default function TeacherStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [filtered, setFiltered] = useState<Student[]>([]);
    const [search, setSearch] = useState('');
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        fetch('/api/users/students').then(res => res.json()).then(data => {
            setStudents(data);
            setFiltered(data);
        });
    }, []);

    const handleSearch = (val: string) => {
        setSearch(val);
        const lower = val.toLowerCase();
        setFiltered(students.filter(s =>
            s.name.includes(lower) ||
            s.loginId.includes(lower) ||
            (s.grade + '').includes(lower)
        ));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStudent) return;

        try {
            const res = await fetch(`/api/admin/users/${editingStudent.id}`, {
                method: 'PATCH', // Reusing admin API if permitted, or create teacher specific
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingStudent)
            });

            if (res.ok) {
                toast.success('정보가 수정되었습니다.');
                setEditingStudent(null);
                // Refresh
                const refreshed = await fetch('/api/users/students').then(r => r.json());
                setStudents(refreshed);
                handleSearch(search); // Re-filter
            } else {
                toast.error('수정에 실패했습니다.');
            }
        } catch (e) {
            toast.error('오류가 발생했습니다.');
        }
    };

    const handlePasswordReset = async () => {
        if (!selectedStudentId || !newPassword) return;

        try {
            const res = await fetch(`/api/admin/users/${selectedStudentId}/password`, { // Need to ensure this API exists or create it
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword })
            });

            if (res.ok) {
                toast.success('비밀번호가 변경되었습니다.');
                setPasswordModalOpen(false);
                setNewPassword('');
            } else {
                toast.error('비밀번호 변경 실패');
            }
        } catch (e) {
            toast.error('오류 발생');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">학생 관리</h1>

            <div className="flex items-center gap-4">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="이름, 아이디 검색..."
                        className="pl-9"
                        value={search}
                        onChange={e => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {/* Desktop View */}
                    <Table className="hidden md:table">
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                <TableHead>학번/이름</TableHead>
                                <TableHead>아이디</TableHead>
                                <TableHead>학년</TableHead>
                                <TableHead>반</TableHead>
                                <TableHead>번호</TableHead>
                                <TableHead className="text-right">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map(student => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">
                                        {student.grade}{student.class}{String(student.number).padStart(2, '0')} {student.name}
                                    </TableCell>
                                    <TableCell>{student.loginId}</TableCell>
                                    <TableCell>
                                        {editingStudent?.id === student.id ? (
                                            <Input
                                                type="number"
                                                className="w-16 h-8"
                                                value={editingStudent.grade}
                                                onChange={e => setEditingStudent({ ...editingStudent, grade: parseInt(e.target.value) })}
                                            />
                                        ) : student.grade}
                                    </TableCell>
                                    <TableCell>
                                        {editingStudent?.id === student.id ? (
                                            <Input
                                                type="number"
                                                className="w-16 h-8"
                                                value={editingStudent.class}
                                                onChange={e => setEditingStudent({ ...editingStudent, class: parseInt(e.target.value) })}
                                            />
                                        ) : student.class}
                                    </TableCell>
                                    <TableCell>
                                        {editingStudent?.id === student.id ? (
                                            <Input
                                                type="number"
                                                className="w-16 h-8"
                                                value={editingStudent.number}
                                                onChange={e => setEditingStudent({ ...editingStudent, number: parseInt(e.target.value) })}
                                            />
                                        ) : student.number}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {editingStudent?.id === student.id ? (
                                            <>
                                                <Button size="sm" onClick={handleUpdate}>저장</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingStudent(null)}>취소</Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button size="sm" variant="outline" onClick={() => setEditingStudent(student)}>
                                                    <Edit className="w-3 h-3 mr-1" /> 정보수정
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => { setSelectedStudentId(student.id); setPasswordModalOpen(true); }}>
                                                    <Lock className="w-3 h-3 mr-1" /> 비번변경
                                                </Button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Mobile View */}
                    <div className="md:hidden divide-y">
                        {filtered.map(student => (
                            <div key={student.id} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-lg">{student.name}</div>
                                        <div className="text-sm text-gray-500">@{student.loginId}</div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className="text-sm">
                                            {student.grade}학년 {student.class}반 {student.number}번
                                        </Badge>
                                    </div>
                                </div>

                                {editingStudent?.id === student.id ? (
                                    <div className="bg-gray-50 p-3 rounded-md space-y-3">
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <Label className="text-xs">학년</Label>
                                                <Input
                                                    type="number"
                                                    className="h-8"
                                                    value={editingStudent.grade}
                                                    onChange={e => setEditingStudent({ ...editingStudent, grade: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">반</Label>
                                                <Input
                                                    type="number"
                                                    className="h-8"
                                                    value={editingStudent.class}
                                                    onChange={e => setEditingStudent({ ...editingStudent, class: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">번호</Label>
                                                <Input
                                                    type="number"
                                                    className="h-8"
                                                    value={editingStudent.number}
                                                    onChange={e => setEditingStudent({ ...editingStudent, number: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" className="flex-1" onClick={handleUpdate}>저장</Button>
                                            <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditingStudent(null)}>취소</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="flex-1 h-9" onClick={() => setEditingStudent(student)}>
                                            <Edit className="w-3 h-3 mr-1" /> 정보수정
                                        </Button>
                                        <Button size="sm" variant="outline" className="flex-1 h-9" onClick={() => { setSelectedStudentId(student.id); setPasswordModalOpen(true); }}>
                                            <Lock className="w-3 h-3 mr-1" /> 비번변경
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>비밀번호 변경</DialogTitle>
                        <DialogDescription>
                            학생의 비밀번호를 강제로 변경합니다.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>새 비밀번호</Label>
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="새 비밀번호 입력"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPasswordModalOpen(false)}>취소</Button>
                        <Button onClick={handlePasswordReset}>변경하기</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
