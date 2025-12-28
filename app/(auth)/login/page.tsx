'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Bug } from 'lucide-react';
import Image from 'next/image';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');

    const performLogin = async (id: string, pw: string) => {
        setLoading(true);
        try {
            const res = await signIn('credentials', {
                loginId: id,
                password: pw,
                redirect: false,
            });

            if (res?.error) {
                toast.error('로그인 정보를 확인해주세요.');
            } else {
                toast.success('로그인 성공');
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            toast.error('오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginId || !password) return;
        await performLogin(loginId, password);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 relative">
                <div className="absolute top-4 right-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                                <Bug className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => performLogin('admin', '1234')}>
                                관리자 (admin)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => performLogin('teacher', '1234')}>
                                교사 (teacher)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => performLogin('student', '1234')}>
                                학생 (student)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex flex-col items-center mb-8">
                    <Image
                        src="/school-logo.png"
                        alt="Logo"
                        width={120}
                        height={120}
                        className="mb-4 object-contain"
                        priority
                    />
                    <h1 className="text-2xl font-bold text-red-600">DGHS</h1>
                    <p className="text-gray-500 text-sm mt-1">학습 관리 시스템</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="loginId">아이디</Label>
                        <Input
                            id="loginId"
                            type="text"
                            placeholder="아이디를 입력하세요"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">비밀번호</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-base"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                로그인 중...
                            </>
                        ) : (
                            '로그인'
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
