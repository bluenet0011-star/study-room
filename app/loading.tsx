import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
                <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">Loading...</p>
        </div>
    );
}
