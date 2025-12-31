'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="max-w-md w-full shadow-lg border-red-100">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">문제가 발생했습니다</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-gray-600 pb-6">
                    <p>죄송합니다. 요청을 처리하는 중에 예상치 못한 오류가 발생했습니다.</p>
                    <p className="text-sm mt-2 text-gray-500">
                        ({error.message || '알 수 없는 오류'})
                    </p>
                </CardContent>
                <CardFooter className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={() => router.push('/')}>
                        <Home className="w-4 h-4 mr-2" />
                        홈으로
                    </Button>
                    <Button onClick={() => reset()}>
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        다시 시도
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
