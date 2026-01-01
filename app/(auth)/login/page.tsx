'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Bug, GraduationCap } from 'lucide-react';
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-4 relative overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-100/50 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl animate-pulse delay-700" />

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="absolute top-4 right-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 text-gray-500 hover:text-gray-900 border-gray-200 hover:border-gray-300 hover:bg-gray-50">
                                <Bug className="w-4 h-4" />
                                <span>테스트 계정</span>
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

                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-tr from-primary to-primary/80 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/20 transform rotate-3">
                        <GraduationCap className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-black text-primary mb-2 tracking-tight">DGHS</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="loginId" className="text-xs font-semibold text-gray-500 ml-1">학번</Label>
                        <Input
                            id="loginId"
                            type="text"
                            placeholder="학번 입력"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            disabled={loading}
                            required
                            className="bg-gray-50/50 border-gray-200 focus:bg-white transition-all h-12"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-xs font-semibold text-gray-500 ml-1">비밀번호</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="비밀번호 입력"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                            className="bg-gray-50/50 border-gray-200 focus:bg-white transition-all h-12"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-gray-900 hover:bg-black text-white font-medium text-base rounded-xl transition-all shadow-lg shadow-gray-200 hover:shadow-xl mt-4"
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

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        © 2024 Dongtan Global High School. All rights reserved.
                    </p>
                </div>
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
