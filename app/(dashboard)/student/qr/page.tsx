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
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
            <Card className="w-full max-w-md text-center shadow-lg border-2 border-primary/10">
                <CardHeader>
                    <CardTitle className="scroll-m-20 text-2xl font-bold tracking-tight">모바일 학생증 (QR)</CardTitle>
                    <CardDescription>
                        출석 체크 및 입실 확인용 QR코드입니다.<br />
                        1분마다 자동으로 갱신됩니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6">
                    <div className="relative p-6 bg-white rounded-xl shadow-inner border">
                        {qrValue ? (
                            <img src={qrUrl} alt="Student QR" width={250} height={250} className="mix-blend-multiply" />
                        ) : (
                            <div className="w-[250px] h-[250px] flex items-center justify-center bg-gray-100 rounded">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-xl font-bold">{session.user.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            {format(timestamp, 'PPP a h:mm:ss', { locale: ko })} 기준
                        </p>
                    </div>

                    <Button onClick={generateQR} size="lg" className="w-full gap-2">
                        <RefreshCw className="w-4 h-4" />
                        지금 새로고침
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
