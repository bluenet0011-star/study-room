import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="relative flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-red-100"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-red-600 border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <p className="text-sm font-semibold text-red-600 animate-pulse tracking-wide">LOADING</p>
                    <p className="text-[10px] text-gray-400">잠시만 기다려주세요...</p>
                </div>
            </div>
        </div>
    );
}
