'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 gap-6 p-4 text-center">
            <div className="bg-red-100 p-4 rounded-full">
                <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">오류가 발생했습니다</h2>
                <p className="text-gray-600 max-w-md">
                    죄송합니다. 요청을 처리하는 중 문제가 발생했습니다.
                    <br />
                    잠시 후 다시 시도해 주세요.
                </p>
            </div>
            <div className="flex gap-4">
                <Button onClick={() => reset()} variant="default">
                    다시 시도
                </Button>
                <Button onClick={() => window.location.href = '/'} variant="outline">
                    홈으로 이동
                </Button>
            </div>
        </div>
    );
}
