'use client';

import { useState, useRef, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Check, ScanLine } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EventScanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [scanInput, setScanInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [attendees, setAttendees] = useState<any[]>([]);

    // Scanner state
    const scannerRef = useRef<any>(null);
    const [isScannerRunning, setIsScannerRunning] = useState(false);
    const [useFrontCamera, setUseFrontCamera] = useState(false);

    // Focus input on load & Start Scanner
    useEffect(() => {
        inputRef.current?.focus();

        // Initialize Scanner
        // @ts-ignore
        if (typeof Html5Qrcode !== 'undefined' && !scannerRef.current) {
            // @ts-ignore
            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };

            // Auto start with environment camera
            html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText: string) => {
                    handleScanInput(decodedText);
                },
                (errorMessage: any) => {
                    // ignore errors
                }
            ).then(() => {
                setIsScannerRunning(true);
            }).catch((err: any) => {
                console.error("Error starting scanner", err);
                // toast.error("카메라 권한을 확인해주세요.");
            });
        }

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current.clear();
                }).catch((err: any) => console.error(err));
            }
        };
    }, []);

    const toggleCamera = () => {
        if (!scannerRef.current || !isScannerRunning) return;

        const nextUseFront = !useFrontCamera;
        setUseFrontCamera(nextUseFront);

        scannerRef.current.stop().then(() => {
            const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };
            const cameraConfig = nextUseFront ? { facingMode: "user" } : { facingMode: "environment" };

            return scannerRef.current.start(
                cameraConfig,
                config,
                (decodedText: string) => handleScanInput(decodedText),
                (err: any) => { }
            );
        }).then(() => {
            setIsScannerRunning(true);
        }).catch((err: any) => {
            console.error("Failed to toggle camera", err);
            toast.error("카메라 전환 실패");
        });
    };

    const handleScanInput = (text: string) => {
        let name = '';
        let studentId = '';

        try {
            const data = JSON.parse(text);
            name = data.name;
            studentId = data.id;
        } catch {
            name = `학번 ${text}`;
            studentId = text;
        }

        addAttendee(name, studentId);
    };

    const handleScan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!scanInput) return;
        handleScanInput(scanInput);
        setScanInput('');
        // Keep focus on input for continuous scanning if utilizing a handheld scanner acting as keyboard
        inputRef.current?.focus();
    };

    const addAttendee = (name: string, studentId: string) => {
        setAttendees(prev => {
            // Check if student is already in the list
            const exists = prev.some(p => p.studentId === studentId);
            if (exists) {
                // Optional: Show a different toast or just ignore silently to avoid noise
                // toast.info(`${name} 학생은 이미 출석했습니다.`);
                return prev;
            }

            // If not duplicate, add and show unique success toast
            toast.success(`${name} 출석 완료!`);
            return [{
                id: Date.now(),
                name,
                studentId,
                time: new Date().toLocaleTimeString()
            }, ...prev];
        });
    };

    return (
        <div className="p-6 h-[calc(100vh-60px)] flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/teacher/events">
                    <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">출석 스캔 모드</h1>
                    <p className="text-gray-500 text-sm">QR 코드를 스캔하거나 학번을 입력하세요.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                {/* Input Area */}
                <Card className="flex flex-col justify-center items-center p-8 border-2 border-primary/20 bg-blue-50/30 overflow-hidden">

                    <div className="relative mb-6 rounded-lg overflow-hidden shadow-lg bg-black">
                        <div id="reader" className="w-[300px] h-[300px]"></div>
                        {isScannerRunning && (
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="absolute bottom-2 right-2 z-10 opacity-90 text-xs h-8"
                                onClick={toggleCamera}
                            >
                                <ScanLine className="w-3 h-3 mr-1" />
                                {useFrontCamera ? "후면 전환" : "전면 전환"}
                            </Button>
                        )}
                    </div>

                    {!scanInput && !isScannerRunning && <div className="bg-white p-4 rounded-full mb-6 shadow-sm">
                        <ScanLine className="w-12 h-12 text-blue-500" />
                    </div>}

                    <form onSubmit={handleScan} className="w-full max-w-sm space-y-4">
                        <Input
                            ref={inputRef}
                            value={scanInput}
                            onChange={e => setScanInput(e.target.value)}
                            placeholder="QR 스캔 대기 중..."
                            className="text-center text-lg h-12"
                            autoComplete="off"
                        />
                        <p className="text-center text-xs text-gray-400">
                            카메라가 자동으로 실행됩니다.
                        </p>
                    </form>
                </Card>

                {/* List Area */}
                <Card className="flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 font-semibold flex justify-between">
                        <span>출석 명단 ({attendees.length}명)</span>
                        <Button variant="ghost" size="sm" onClick={() => setAttendees([])}>초기화</Button>
                    </div>
                    <div className="flex-1 overflow-auto p-2 space-y-2">
                        {attendees.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg bg-white animate-in slide-in-from-top-2">
                                <span className="font-bold">{user.name}</span>
                                <span className="text-sm text-gray-500">{user.time}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
