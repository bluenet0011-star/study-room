import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <FileQuestion className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-2">
                404
            </h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                페이지를 찾을 수 없습니다
            </h2>
            <p className="text-gray-500 max-w-md mb-8">
                요청하신 페이지가 존재하지 않거나, 주소가 변경되었을 수 있습니다.<br />
                입력하신 주소가 정확한지 다시 한 번 확인해주세요.
            </p>
            <div className="flex gap-4">
                <Button asChild variant="default" size="lg" className="rounded-full px-8">
                    <Link href="/">
                        <Home className="w-4 h-4 mr-2" />
                        홈으로 이동
                    </Link>
                </Button>
            </div>
        </div>
    );
}
