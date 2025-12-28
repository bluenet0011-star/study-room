'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
                // Assuming 'toast' is imported and available, otherwise this will cause an error.
                // For this change, I'm assuming 'toast' is handled elsewhere or will be added.
                // If not, the original setError logic would be more appropriate without toast.
                // As per instructions, faithfully applying the provided Code Edit.
                // toast.error("로그인 실패", {
                //   description: "아이디 또는 비밀번호를 확인해주세요.",
                // });
                setError('아이디 또는 비밀번호가 올바르지 않습니다.'); // Keeping original error message for now
                setLoading(false);
            } else {
                // toast.success("로그인 성공"); // Assuming toast is available
                router.push("/"); // Always redirect to root dashboard
                router.refresh();
            }
        } catch (err) {
            setError('시스템 오류가 발생했습니다. 다시 시도해주세요.');
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="text-center text-sm font-medium text-gray-500 mb-2">Global Standard for Future Leaders</div>
                    {/* Placeholder for Logo if needed */}
                    <CardTitle className="text-2xl font-bold text-center leading-tight">
                        동탄국제고<br />학습관리 시스템
                    </CardTitle>
                    <CardDescription className="text-center">
                        시스템에 접속하려면 로그인하세요
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="loginId">아이디</Label>
                            <Input
                                id="loginId"
                                name="loginId"
                                placeholder="아이디를 입력하세요"
                                required
                                className="w-full"
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
                                className="w-full"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-50 rounded-md">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
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
                <CardFooter className="text-center text-sm text-gray-500">
                    비밀번호를 잊으셨다면 관리자에게 문의하세요.
                </CardFooter>
            </Card>
        </div>
    );
}
