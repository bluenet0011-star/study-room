'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function StudentQRPage() {
    const { data: session } = useSession();
    const [qrValue, setQrValue] = useState("");
    const [timestamp, setTimestamp] = useState(new Date());

    const generateQR = () => {
        if (!session?.user) return;
        const now = new Date();
        setTimestamp(now);
        // Format: ID | Name | Role | Timestamp (valid for 5 mins)
        const data = JSON.stringify({
            id: session.user.id,
            name: session.user.name,
            role: session.user.role,
            ts: now.getTime()
        });
        setQrValue(data);
    };

    useEffect(() => {
        generateQR();
        const timer = setInterval(generateQR, 60000); // Auto refresh every 1 min
        return () => clearInterval(timer);
    }, [session]);

    if (!session) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrValue)}`;

    return (
        <div className="flex flex-col items-center justify-center p-4 md:p-8 min-h-[80vh]">
            <div className="w-full max-w-sm relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-[20px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

                <Card className="relative w-full overflow-hidden border-none shadow-2xl rounded-[18px] bg-white ring-1 ring-black/5">
                    {/* ID Card Header */}
                    <div className="h-24 bg-gradient-to-r from-blue-700 to-blue-900 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/school-logo.png')] bg-repeat opacity-5 bg-[length:50px_50px] mix-blend-overlay"></div>
                        <div className="absolute bottom-[-1px] left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
                        <div className="absolute top-4 left-4 text-white">
                            <h2 className="text-xs font-semibold text-blue-200 tracking-wider mb-0.5 uppercase">Dongtan Global High School</h2>
                            <h1 className="text-xl font-bold tracking-tight">M. Student ID</h1>
                        </div>
                    </div>

                    <CardContent className="flex flex-col items-center pt-0 pb-8 px-6 -mt-10 relative z-10">
                        {/* Profile/QR Container */}
                        <div className="bg-white p-2 rounded-xl shadow-lg mb-6 ring-1 ring-black/5">
                            <div className="bg-white border rounded-lg p-2 relative overflow-hidden group-hover:shadow transition-shadow">
                                {qrValue ? (
                                    <>
                                        <img src={qrUrl} alt="Student QR" width={220} height={220} className="mix-blend-multiply" />
                                        {/* Scan Animation Line */}
                                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-[scan_2s_infinite]"></div>
                                    </>
                                ) : (
                                    <div className="w-[220px] h-[220px] flex items-center justify-center bg-gray-50">
                                        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* User Check-in Countdown */}
                        <div className="w-full max-w-[220px] h-1.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
                            <div className="h-full bg-blue-500 animate-[progress_60s_linear_infinite]" key={timestamp.getTime()}></div>
                        </div>

                        {/* Student Info */}
                        <div className="text-center space-y-1">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{session.user.name}</h3>
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Active Status
                            </div>
                            <p className="text-xs text-gray-400 mt-2 font-mono">
                                Generated: {format(timestamp, 'HH:mm:ss', { locale: ko })}
                            </p>
                        </div>

                        <div className="mt-8 w-full">
                            <Button onClick={generateQR} variant="outline" className="w-full border-dashed border-gray-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors h-12 rounded-xl">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                수동 새로고침
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <p className="mt-6 text-xs text-center text-gray-400 max-w-xs leading-relaxed">
                * 이 QR코드는 출입 및 출석 확인 용도로만 사용 가능합니다.<br />
                * 캡처된 이미지는 유효하지 않을 수 있습니다.
            </p>

            <style jsx global>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { top: 100%; opacity: 0; }
                }
                @keyframes progress {
                    0% { width: 100%; }
                    100% { width: 0%; }
                }
            `}</style>
        </div>
    );
}
