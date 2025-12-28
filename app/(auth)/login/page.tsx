'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const loginId = formData.get('loginId') as string;
        const password = formData.get('password') as string;

        try {
            const result = await signIn('credentials', {
                loginId,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('아이디 또는 비밀번호가 올바르지 않습니다.');
                setLoading(false);
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            setError('시스템 오류가 발생했습니다. 다시 시도해주세요.');
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-gray-100 p-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary animate-in fade-in zoom-in duration-500">
                <CardHeader className="space-y-4 flex flex-col items-center pb-2">
                    <div className="w-24 h-24 relative mb-2 transition-transform hover:scale-105 duration-300">
                        <Image
                            src="/school-logo.png"
                            alt="Dongtan Global High School Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="text-center space-y-1">
                        <div className="text-xs font-bold text-primary tracking-widest uppercase">Global Standard for Future Leaders</div>
                        <CardTitle className="text-2xl font-bold text-gray-900 leading-tight">
                            동탄국제고등학교<br />
                            <span className="text-xl text-gray-600">자습실 관리 시스템</span>
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="loginId">아이디</Label>
                            <Input
                                id="loginId"
                                name="loginId"
                                placeholder="학번 또는 교직원 번호"
                                required
                                className="w-full h-11 focus-visible:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">비밀번호</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="비밀번호를 입력하세요"
                                required
                                className="w-full h-11 focus-visible:ring-primary"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md animate-in slide-in-from-top-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all" disabled={loading}>
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
                </CardContent>
                <CardFooter className="flex flex-col gap-2 text-center text-xs text-gray-500 bg-gray-50/50 py-4 rounded-b-lg border-t">
                    <p>비밀번호 분실 시 담당 교사에게 문의하세요.</p>
                    <p className="opacity-70">© Dongtan Global High School. All rights reserved.</p>
                </CardFooter>
            </Card>
        </div>
    );
}
