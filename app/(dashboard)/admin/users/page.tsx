'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExcelImport } from '@/components/admin/ExcelImport';
import ExcelExport from "@/components/admin/ExcelExport";
import ExcelTemplate from "@/components/admin/ExcelTemplate";

interface UserData {
    id: string;
    loginId: string;
    name: string;
    role: string;
    grade: number | null;
    class: number | null;
    number: number | null;
    active: boolean;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [search, setSearch] = useState('');
    const [editingUser, setEditingUser] = useState<UserData | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => fetch('/api/admin/users').then(res => res.json()).then(setUsers);

    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        fetchUsers();
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        await fetch(`/api/admin/users/${editingUser.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingUser)
        });
        setEditingUser(null);
        fetchUsers();
    };

    const filteredUsers = users.filter(u =>
        u.name.includes(search) || u.loginId.includes(search)
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">사용자 관리</h1>
                <div className="flex gap-2">
                    <ExcelTemplate />
                    <ExcelExport data={filteredUsers} />
                    <ExcelImport />
                </div>
            </div>

            <Card className="mb-4">
                <CardContent className="pt-6">
                    <input
                        className="w-full p-2 border rounded"
                        placeholder="이름 또는 아이디로 검색..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>사용자 목록 ({filteredUsers.length}명)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>아이디</TableHead>
                                <TableHead>이름</TableHead>
                                <TableHead>역할</TableHead>
                                <TableHead>학년/반</TableHead>
                                <TableHead>활성</TableHead>
                                <TableHead>작업</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.loginId}</TableCell>
                                    <TableCell>
                                        {editingUser?.id === user.id ? (
                                            <input className="border p-1 w-20" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} />
                                        ) : user.name}
                                    </TableCell>
                                    <TableCell>
                                        {editingUser?.id === user.id ? (
                                            <select
                                                className="border p-1 rounded text-sm"
                                                value={editingUser.role}
                                                onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                                            >
                                                <option value="STUDENT">학생</option>
                                                <option value="TEACHER">교사</option>
                                                <option value="ADMIN">관리자</option>
                                            </select>
                                        ) : (
                                            user.role === 'STUDENT' ? '학생' : user.role === 'TEACHER' ? '교사' : '관리자'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingUser?.id === user.id ? (
                                            <div className="flex gap-1 items-center">
                                                <input className="border p-1 w-10 text-center" placeholder="학" value={editingUser.grade || ''} onChange={e => setEditingUser({ ...editingUser, grade: parseInt(e.target.value) || null })} />
                                                -
                                                <input className="border p-1 w-10 text-center" placeholder="반" value={editingUser.class || ''} onChange={e => setEditingUser({ ...editingUser, class: parseInt(e.target.value) || null })} />
                                                -
                                                <input className="border p-1 w-10 text-center" placeholder="번" value={editingUser.number || ''} onChange={e => setEditingUser({ ...editingUser, number: parseInt(e.target.value) || null })} />
                                            </div>
                                        ) : (
                                            user.grade ? `${user.grade}-${user.class}-${user.number}` : '-'
                                        )}
                                    </TableCell>
                                    <TableCell>{user.active ? "활성" : "비활성"}</TableCell>
                                    <TableCell className="flex gap-2">
                                        {editingUser?.id === user.id ? (
                                            <>
                                                <button onClick={handleUpdate} className="text-green-600 font-bold">저장</button>
                                                <button onClick={() => setEditingUser(null)} className="text-gray-500">취소</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => setEditingUser(user)} className="text-blue-600">수정</button>
                                                <button onClick={() => handleDelete(user.id)} className="text-red-600">삭제</button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
