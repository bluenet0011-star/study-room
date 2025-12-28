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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">사용자 관리</h1>
                    <p className="text-muted-foreground mt-1">학생 및 교직원 계정을 관리합니다.</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredUsers.map(user => (
                    <Card key={user.id} className="shadow-sm">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-lg">
                                        {editingUser?.id === user.id ? (
                                            <input className="border p-1 w-full rounded" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} />
                                        ) : user.name}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">{user.loginId}</div>
                                </div>
                                <div className="text-sm">
                                    {editingUser?.id === user.id ? (
                                        <select
                                            className="border p-1 rounded text-sm w-full"
                                            value={editingUser.role}
                                            onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                                        >
                                            <option value="STUDENT">학생</option>
                                            <option value="TEACHER">교사</option>
                                            <option value="ADMIN">관리자</option>
                                        </select>
                                    ) : (
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'STUDENT' ? 'bg-blue-100 text-blue-800' : user.role === 'TEACHER' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.role === 'STUDENT' ? '학생' : user.role === 'TEACHER' ? '교사' : '관리자'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-500 mr-2">학년/반:</span>
                                    {editingUser?.id === user.id ? (
                                        <div className="flex gap-1 items-center mt-1">
                                            <input className="border p-1 w-8 text-center rounded" placeholder="학" value={editingUser.grade || ''} onChange={e => setEditingUser({ ...editingUser, grade: parseInt(e.target.value) || null })} />
                                            -
                                            <input className="border p-1 w-8 text-center rounded" placeholder="반" value={editingUser.class || ''} onChange={e => setEditingUser({ ...editingUser, class: parseInt(e.target.value) || null })} />
                                            -
                                            <input className="border p-1 w-8 text-center rounded" placeholder="번" value={editingUser.number || ''} onChange={e => setEditingUser({ ...editingUser, number: parseInt(e.target.value) || null })} />
                                        </div>
                                    ) : (
                                        <span className="font-medium">{user.grade ? `${user.grade}-${user.class}-${user.number}` : '-'}</span>
                                    )}
                                </div>
                                <div>
                                    <span className="text-gray-500 mr-2">상태:</span>
                                    <span className={user.active ? "text-green-600 font-medium" : "text-gray-400"}>{user.active ? "활성" : "비활성"}</span>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-2 border-t mt-2">
                                {editingUser?.id === user.id ? (
                                    <>
                                        <button onClick={handleUpdate} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors">저장</button>
                                        <button onClick={() => setEditingUser(null)} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-300 transition-colors">취소</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setEditingUser(user)} className="border border-blue-600 text-blue-600 px-3 py-1.5 rounded text-sm hover:bg-blue-50 transition-colors">수정</button>
                                        <button onClick={() => handleDelete(user.id)} className="border border-red-600 text-red-600 px-3 py-1.5 rounded text-sm hover:bg-red-50 transition-colors">삭제</button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Desktop Table View */}
            <Card className="hidden md:block">
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
